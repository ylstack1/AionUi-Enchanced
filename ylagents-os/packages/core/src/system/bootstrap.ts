/**
 * Platform-native Secure Storage interface.
 */
export interface SecureStorage {
  store(key: string, secret: string): Promise<void>;
  retrieve(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/**
 * Biometric authentication shim.
 */
export interface Biometrics {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}

/**
 * Native App entry point.
 * Initializes the core and hooks up the platform-specific bridges.
 */
import { CoreService } from '../index';
import { initializeBridge } from '@ylagents/bridge';

export async function bootstrapApp(options: {
  driver: any;
  skillRepo: any;
  secureStorage: SecureStorage;
}) {
  const core = new CoreService(options.driver, options.skillRepo);
  await core.initialize();

  initializeBridge(core);

  console.log('ylagents-os: App bootstrapped successfully');
  return core;
}
