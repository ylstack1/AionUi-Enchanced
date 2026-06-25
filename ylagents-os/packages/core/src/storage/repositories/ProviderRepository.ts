import { DatabaseDriver } from '../Database';

export interface ProviderConfig {
  id: string;
  type: string;
  name: string;
  base_url?: string;
  api_key_ref?: string;
  models?: string;
  capabilities?: string;
  enabled: number;
}

export class ProviderRepository {
  constructor(private driver: DatabaseDriver) {}

  async create(provider: ProviderConfig): Promise<void> {
    const sql = `
      INSERT INTO providers (id, type, name, base_url, api_key_ref, models, capabilities, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const now = Date.now();
    await this.driver.execute(sql, [
      provider.id,
      provider.type,
      provider.name,
      provider.base_url,
      provider.api_key_ref,
      provider.models,
      provider.capabilities,
      provider.enabled,
      now,
      now
    ]);
  }

  async getAll(): Promise<ProviderConfig[]> {
    return this.driver.query<ProviderConfig>('SELECT * FROM providers WHERE enabled = 1');
  }

  async getById(id: string): Promise<ProviderConfig | null> {
    return this.driver.queryOne<ProviderConfig>('SELECT * FROM providers WHERE id = ?', [id]);
  }
}
