import { DatabaseDriver } from '../Database';

/**
 * Capacitor SQLite Driver.
 * Uses @capacitor-community/sqlite for mobile platforms.
 */
export class CapacitorSqliteDriver implements DatabaseDriver {
  private db: any;

  constructor(dbConnection: any) {
    this.db = dbConnection;
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.db.run(sql, params);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result.values as T[];
  }

  async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.db.query(sql, params);
    return (result.values?.[0] as T) || null;
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
