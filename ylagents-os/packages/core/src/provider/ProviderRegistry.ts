import { Provider, ProviderConfig } from './types';

/**
 * Registry for dynamic discovery and management of providers.
 * Supports LLM, Sync, and MCP server providers.
 */
export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): void {
    this.providers.set(provider.type, provider);
    console.log(`ProviderRegistry: Registered ${provider.type}`);
  }

  unregister(type: string): void {
    this.providers.delete(type);
  }

  getProvider<T extends Provider>(type: string): T | undefined {
    return this.providers.get(type) as T;
  }

  async createClient<TClient>(config: ProviderConfig): Promise<TClient> {
    const provider = this.getProvider(config.type);
    if (!provider) {
      throw new Error(`ProviderRegistry: No provider registered for type ${config.type}`);
    }
    return provider.createClient(config);
  }

  listSupportedTypes(): string[] {
    return Array.from(this.providers.keys());
  }
}

import { OpenAIProvider } from './llm/OpenAIProvider';
import { AnthropicProvider } from './llm/AnthropicProvider';

export const globalProviderRegistry = new ProviderRegistry();

// Register default providers
globalProviderRegistry.register(new OpenAIProvider());
globalProviderRegistry.register(new AnthropicProvider());
