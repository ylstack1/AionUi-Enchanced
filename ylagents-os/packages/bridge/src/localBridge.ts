import EventEmitter from 'eventemitter3';

/**
 * Ported from AionUi's ProviderLike pattern.
 * This interface is what all UI components use to communicate.
 */
export type ProviderLike<Data, Params = undefined> = {
  provider: (handler: (params: Params) => Promise<Data>) => void;
  invoke: Params extends undefined ? () => Promise<Data> : (params: Params) => Promise<Data>;
};

/**
 * Creates a local provider that routes directly to an in-process handler.
 * This is the core of the "zero-backend" architecture.
 */
export function localProvider<Data, Params = undefined>(
  handler: (params: Params) => Promise<Data>
): ProviderLike<Data, Params> {
  return {
    provider: () => {
      // In local mode, the provider registration is handled by the bridge initialization.
    },
    invoke: (params?: Params) => handler(params as Params) as Promise<Data>,
  };
}

/**
 * In-process event bus for real-time streaming and notifications.
 * Replaces WebSocket communication from the original AionCore.
 */
export const localEmitter = new EventEmitter();

/**
 * The unified local bridge that UI components import.
 * It mirrors the shape of the original ipcBridge/httpBridge.
 */
export const localBridge = {
  conversation: {
    // Shims for Phase 4/5 implementation
    sendMessage: localProvider(async (params: { conversationId: string; content: string }) => {
      console.log('Bridge: conversation.sendMessage', params);
      return { success: true };
    }),
  },
  system: {
    getSettings: localProvider(async () => {
      return { theme: 'system', language: 'en' };
    }),
  },
};

export default localBridge;
