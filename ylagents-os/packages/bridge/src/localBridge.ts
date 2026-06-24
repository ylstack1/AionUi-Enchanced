import EventEmitter from 'eventemitter3';
import { CoreService } from '@ylagents/core';

export type ProviderLike<Data, Params = undefined> = {
  provider: (handler: (params: Params) => Promise<Data>) => void;
  invoke: Params extends undefined ? () => Promise<Data> : (params: Params) => Promise<Data>;
};

export function localProvider<Data, Params = undefined>(
  handler: (params: Params) => Promise<Data>
): ProviderLike<Data, Params> {
  return {
    provider: () => {},
    invoke: (params?: Params) => handler(params as Params) as Promise<Data>,
  };
}

export const localEmitter = new EventEmitter();

// This will be initialized by the host (Capacitor/Tauri)
let coreService: CoreService;

export function initializeBridge(service: CoreService) {
  coreService = service;
}

/**
 * Concrete implementation of the local bridge.
 * Routes UI calls directly to the CoreService.
 */
export const localBridge = {
  conversation: {
    sendMessage: localProvider(async (params: any) => {
      // For streaming, we emit events via localEmitter
      const stream = coreService.handleSendMessage(params);
      for await (const chunk of stream) {
        localEmitter.emit('conversation.responseStream', {
          conversationId: params.conversationId,
          ...chunk
        });
      }
      return { success: true };
    }),

    getHistory: localProvider(async (params: { conversationId: string }) => {
      return coreService.messageRepo.getByConversation(params.conversationId);
    })
  },

  assistants: {
    list: localProvider(async () => {
      return coreService.db.getDriver().query('SELECT * FROM assistants ORDER BY sort_order ASC');
    })
  },

  system: {
    getSettings: localProvider(async () => {
      return { theme: 'system', language: 'en' };
    }),

    storeCredential: localProvider(async (params: { key: string; secret: string }) => {
      // In real impl, this calls native SecureStorage
      console.log('Bridge: Storing credential reference', params.key);
      return { success: true };
    })
  },
};

export default localBridge;
