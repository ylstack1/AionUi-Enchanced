import { DatabaseDriver } from '../storage/Database';
import { SkillIndex, SkillDefinition, SkillRepository } from './SkillManager';

export class SqliteSkillRepository implements SkillRepository {
  constructor(private driver: DatabaseDriver) {}

  async listEnabled(): Promise<SkillIndex[]> {
    return this.driver.query<SkillIndex>('SELECT name, description FROM skills WHERE enabled = 1');
  }

  async getContent(name: string): Promise<string | null> {
    const row = await this.driver.queryOne<{ content: string }>('SELECT content FROM skills WHERE name = ?', [name]);
    return row?.content || null;
  }

  async upsert(skill: SkillDefinition): Promise<void> {
    const sql = `
      INSERT INTO skills (id, name, description, source, version, tags, enabled, is_auto_inject, content, installed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        description = excluded.description,
        version = excluded.version,
        tags = excluded.tags,
        content = excluded.content,
        updated_at = excluded.updated_at
    `;
    const now = Date.now();
    await this.driver.execute(sql, [
      crypto.randomUUID(), skill.name, skill.description,
      skill.source, skill.version, skill.tags?.join(','),
      1, skill.isAutoInject ? 1 : 0, skill.content, now, now
    ]);
  }
}
