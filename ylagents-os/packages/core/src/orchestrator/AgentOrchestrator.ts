import { LLMClient, ChatMessage } from '../provider/types';
import { MessageRepository } from '../storage/repositories/MessageRepository';
import { SkillManager } from '../skill/SkillManager';

export interface OrchestratorOptions {
  conversationId: string;
  assistantId: string;
  model: string;
}

/**
 * Native TS Agent Orchestrator.
 * Handles the message turn loop, skill injection, and tool routing.
 * Ported from AionrsAgentManager pattern.
 */
export class AgentOrchestrator {
  private loadedSkills: Set<string> = new Set();

  constructor(
    private llmClient: LLMClient,
    private messageRepo: MessageRepository,
    private skillManager: SkillManager
  ) {}

  /**
   * Processes a single user message turn.
   */
  async *processMessage(
    userContent: string,
    options: OrchestratorOptions
  ): AsyncIterable<{ content?: string; done: boolean }> {
    // 1. Save user message to SQLite
    const userMsg = {
      id: crypto.randomUUID(),
      conversation_id: options.conversationId,
      type: 'text' as const,
      role: 'user' as const,
      content: userContent,
      position: Date.now(),
      status: 'sent',
      hidden: 0,
      created_at: Date.now()
    };
    await this.messageRepo.create(userMsg);

    // 2. Fetch history (simplified for scaffold)
    const history = await this.messageRepo.getByConversation(options.conversationId);

    // 2a. Resolve Skills (Tier 1 Index)
    const skillIndex = await this.skillManager.getSkillIndex();
    const skillSystemPrompt = this.skillManager.formatIndexForPrompt(skillIndex);

    // 2b. Add loaded skill contents (Tier 2)
    let loadedSkillContent = '';
    for (const skillName of this.loadedSkills) {
      const content = await this.skillManager.loadSkillContent(skillName);
      if (content) {
        loadedSkillContent += `\n\n--- SKILL: ${skillName} ---\n${content}`;
      }
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: `${skillSystemPrompt}\n${loadedSkillContent}` },
      ...history.map(m => ({
        role: m.role as any,
        content: m.content
      }))
    ];

    // 3. Call LLM Provider
    const assistantMsgId = crypto.randomUUID();
    let fullAssistantContent = '';

    try {
      for await (const chunk of this.llmClient.chat(messages)) {
        if (chunk.content) {
          fullAssistantContent += chunk.content;

          // Detect [LOAD_SKILL: name]
          const loadSkillMatch = chunk.content.match(/\[LOAD_SKILL:\s*([^\]]+)\]/);
          if (loadSkillMatch) {
            const skillName = loadSkillMatch[1].trim();
            this.loadedSkills.add(skillName);
            console.log(`Orchestrator: Agent requested skill load: ${skillName}`);
          }

          yield { content: chunk.content, done: false };
        }

        if (chunk.done) {
          break;
        }
      }

      // 4. Persist assistant response
      await this.messageRepo.create({
        id: assistantMsgId,
        conversation_id: options.conversationId,
        type: 'text',
        role: 'assistant',
        content: fullAssistantContent,
        position: Date.now(),
        status: 'sent',
        hidden: 0,
        created_at: Date.now()
      });

      yield { done: true };
    } catch (error) {
      console.error('Orchestrator: Message turn failed', error);
      throw error;
    }
  }
}
