/**
 * Skill Manager
 * Implements the two-tier skill system (Index + Content).
 * Ported from AcpSkillManager Rust implementation.
 */

export interface SkillIndex {
  name: string;
  description: string;
}

export interface SkillDefinition {
  name: string;
  description: string;
  content: string; // The full SKILL.md body
  isAutoInject: boolean;
}

export interface SkillRepository {
  listEnabled(): Promise<SkillIndex[]>;
  getContent(name: string): Promise<string | null>;
}

export class SkillManager {
  constructor(private repository: SkillRepository) {}

  /**
   * Tier 1: Returns a compact index of all enabled skills.
   * Suitable for constant injection into system prompts.
   */
  async getSkillIndex(): Promise<SkillIndex[]> {
    return this.repository.listEnabled();
  }

  /**
   * Tier 2: Loads the full content of a specific skill.
   * Called when an agent requests [LOAD_SKILL: name].
   */
  async loadSkillContent(name: string): Promise<string | null> {
    return this.repository.getContent(name);
  }

  /**
   * Formats the skill index for the system prompt.
   */
  formatIndexForPrompt(index: SkillIndex[]): string {
    if (index.length === 0) return '';

    return [
      'AVAILABLE SKILLS:',
      ...index.map(s => `- ${s.name}: ${s.description}`),
      'To use a skill, output [LOAD_SKILL: skill_name] in your response.'
    ].join('\n');
  }
}
