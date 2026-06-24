import { SecureStorage } from '../system/bootstrap';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Node File-based Secure Storage (Simulated for Environment).
 * In a real Tauri app, this would use the Tauri Keyring plugin.
 */
export class NodeSecureStorage implements SecureStorage {
  private storagePath: string;

  constructor(basePath: string) {
    this.storagePath = path.join(basePath, '.secure_vault');
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async store(key: string, secret: string): Promise<void> {
    const filePath = path.join(this.storagePath, btoa(key));
    // In real prod, this would be encrypted via OS Keyring
    fs.writeFileSync(filePath, secret, 'utf8');
  }

  async retrieve(key: string): Promise<string | null> {
    const filePath = path.join(this.storagePath, btoa(key));
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.storagePath, btoa(key));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
