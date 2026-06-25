import { AgentOrchestrator } from './orchestrator/AgentOrchestrator';
import { ProviderRegistry, globalProviderRegistry } from './provider/ProviderRegistry';
import { MessageRepository } from './storage/repositories/MessageRepository';
import { SkillManager } from './skill/SkillManager';
import { Database, DatabaseDriver } from './storage/Database';

/**
 * Unified Core Service.
 * The central orchestration point for the native TS runtime.
 */
export class CoreService {
  public orchestrator: AgentOrchestrator;
  public providerRegistry: ProviderRegistry = globalProviderRegistry;
  public messageRepo: MessageRepository;
  public skillManager: SkillManager;
  public db: Database;

  constructor(driver: DatabaseDriver, skillRepo: any) {
    this.db = new Database(driver);
    this.messageRepo = new MessageRepository(driver);
    this.skillManager = new SkillManager(skillRepo);

    // Default orchestrator
    this.orchestrator = new AgentOrchestrator(
      null as any,
      this.messageRepo,
      this.skillManager
    );
  }

  async initialize() {
    await this.db.initialize();
  }

  /**
   * High-level handler for sending a message.
   */
  async *handleSendMessage(params: {
    conversationId: string;
    content: string;
    providerId: string;
    model: string;
    assistantId: string;
  }) {
    const provider = await this.messageRepo.getDriver().queryOne<any>(
      'SELECT * FROM providers WHERE id = ?', [params.providerId]
    );

    const llmClient = await this.providerRegistry.createClient<any>({
      id: params.providerId,
      type: provider.type,
      name: provider.name,
      api_key_ref: provider.api_key_ref,
      options: { model: params.model }
    });

    const turnOrchestrator = new AgentOrchestrator(
      llmClient,
      this.messageRepo,
      this.skillManager
    );

    for await (const chunk of turnOrchestrator.processMessage(params.content, {
      conversationId: params.conversationId,
      assistantId: params.assistantId,
      model: params.model
    })) {
      yield chunk;
    }
  }
}

// Re-export all sub-modules
export * from './storage/Database';
export * from './storage/repositories/MessageRepository';
export * from './storage/repositories/ProviderRepository';
export * from './provider/types';
export * from './provider/ProviderRegistry';
export * from './orchestrator/AgentOrchestrator';
export * from './skill/SkillManager';
export * from './system/bootstrap';
