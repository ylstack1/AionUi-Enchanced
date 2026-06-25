import { CoreService } from '../index';
import { initializeBridge } from '@ylagents/bridge';

export interface SecureStorage {
  store(key: string, secret: string): Promise<void>;
  retrieve(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export interface Biometrics {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}

/**
 * Native App entry point.
 * Initializes the core and hooks up the platform-specific bridges.
 */
export async function bootstrapApp(options: {
  driver: any;
  skillRepo: any;
  secureStorage: SecureStorage;
}) {
  console.log('ylagents-os: Bootstrapping application...');

  const core = new CoreService(options.driver, options.skillRepo);
  await core.initialize();

  // Link the core to the bridge
  initializeBridge(core);

  // Expose global bridge for UI consumption
  if (typeof window !== 'undefined') {
    (window as any).ylagentsBridge = require('@ylagents/bridge').localBridge;
    (window as any).ylagentsEmitter = require('@ylagents/bridge').localEmitter;
  }

  console.log('ylagents-os: App bootstrapped and bridged successfully');
  return core;
}
