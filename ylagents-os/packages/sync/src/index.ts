export interface SyncProvider {
  push(lastSyncAt: number): Promise<void>;
  pull(lastSyncAt: number): Promise<void>;
}

export class SyncManager {
  private activeProvider: SyncProvider | null = null;

  constructor(private storage: { getLastSyncAt(): Promise<number>; setLastSyncAt(ts: number): Promise<void> }) {}

  setProvider(provider: SyncProvider) {
    this.activeProvider = provider;
  }

  async sync(): Promise<void> {
    if (!this.activeProvider) return;

    const lastSyncAt = await this.storage.getLastSyncAt();
    await this.activeProvider.pull(lastSyncAt);
    await this.activeProvider.push(lastSyncAt);
    await this.storage.setLastSyncAt(Date.now());

    console.log('SyncManager: Sync complete');
  }
}

/**
 * Placeholder for Turso Cloud sync provider.
 * Will use user's own credentials to sync the SQLite database.
 */
export class TursoSyncProvider implements SyncProvider {
  async push(lastSyncAt: number): Promise<void> {
    // Implementation for diff-based push
  }

  async pull(lastSyncAt: number): Promise<void> {
    // Implementation for diff-based pull
  }
}
