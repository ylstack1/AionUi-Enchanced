import { AGENT_FS_SCHEMA } from './schema';

/**
 * Interface for the SQLite driver.
 * Supports platform-specific implementations (better-sqlite3 for desktop, Capacitor for mobile).
 */
export interface DatabaseDriver {
  execute(sql: string, params?: any[]): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  close(): Promise<void>;
}

export class Database {
  constructor(private driver: DatabaseDriver) {}

  /**
   * Initializes the database by executing the schema.
   */
  async initialize(): Promise<void> {
    try {
      await this.driver.execute(AGENT_FS_SCHEMA);
      // Enable WAL mode for concurrent streaming
      await this.driver.execute('PRAGMA journal_mode = WAL;');
      console.log('Database: Initialized AgentFS schema.');
    } catch (error) {
      console.error('Database: Initialization failed', error);
      throw error;
    }
  }

  getDriver(): DatabaseDriver {
    return this.driver;
  }
}
