import { LLMClient, ChatMessage, ChatChunk, Provider, ProviderConfig } from '../types';

export class AnthropicClient implements LLMClient {
  constructor(private config: ProviderConfig) {}

  async *chat(messages: ChatMessage[], tools?: any[]): AsyncIterable<ChatChunk> {
    console.log(`Anthropic: Calling with model ${this.config.options?.model}`);

    // Mock implementation for scaffold
    yield { content: 'This is a response from the Anthropic provider.', done: false };
    yield { done: true };
  }
}

export class AnthropicProvider implements Provider<ProviderConfig, AnthropicClient> {
  type = 'anthropic';

  async createClient(config: ProviderConfig): Promise<AnthropicClient> {
    return new AnthropicClient(config);
  }

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    return !!config.api_key_ref;
  }
}
