import { McpTransport } from '../types';

/**
 * Native HTTP/SSE transport for MCP.
 * Uses Capacitor/Tauri native plugins to bypass WebView CORS restrictions.
 */
export class NativeHttpTransport implements McpTransport {
  async connect(url: string): Promise<void> {
    console.log(`McpTransport: Connecting to ${url} via native adapter`);
    // In real implementation, use @capacitor/http or @tauri-apps/plugin-http
  }

  async disconnect(): Promise<void> {
    console.log('McpTransport: Disconnected');
  }

  async send(message: any): Promise<void> {
    console.log('McpTransport: Sending', message);
  }

  onNotification(handler: (notification: any) => void): void {
    // Register SSE event listener via native bridge
  }
}
