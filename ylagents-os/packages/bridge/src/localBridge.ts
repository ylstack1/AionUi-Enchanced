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
    }),

    list: localProvider(async () => {
      return coreService.conversationService.list();
    }),

    delete: localProvider(async (id: string) => {
      return coreService.conversationService.delete(id);
    })
  },

  assistants: {
    list: localProvider(async () => {
      return coreService.assistantService.listEnabled();
    }),

    get: localProvider(async (id: string) => {
      return coreService.assistantService.getById(id);
    }),

    save: localProvider(async (assistant: any) => {
      return coreService.assistantService.upsert(assistant);
    })
  },

  mcp: {
    listServers: localProvider(async () => {
      return coreService.mcpService.listServers();
    }),

    getAllTools: localProvider(async () => {
      return coreService.mcpService.getAllTools();
    })
  },

  providers: {
    list: localProvider(async () => {
      return coreService.db.getDriver().query('SELECT * FROM providers');
    }),

    save: localProvider(async (provider: any) => {
      const sql = `
        INSERT INTO providers (id, type, name, base_url, api_key_ref, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          base_url = excluded.base_url,
          api_key_ref = excluded.api_key_ref,
          enabled = excluded.enabled,
          updated_at = excluded.updated_at
      `;
      const now = Date.now();
      return coreService.db.getDriver().execute(sql, [
        provider.id, provider.type, provider.name,
        provider.base_url, provider.api_key_ref,
        provider.enabled ? 1 : 0, now, now
      ]);
    })
  },

  system: {
    getSettings: localProvider(async () => {
      return { theme: 'system', language: 'en' };
    }),

    storeCredential: localProvider(async (params: { key: string; secret: string }) => {
      // In real implementation, this is handled by the bootstrap's secureStorage shim
      console.log('Bridge: Credential storage handled via bootstrap wiring');
      return { success: true };
    })
  },
};

export default localBridge;
