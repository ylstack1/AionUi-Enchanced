import { LLMClient, ChatMessage, ChatChunk, Provider, ProviderConfig } from '../types';

export class OpenAIClient implements LLMClient {
  constructor(private config: ProviderConfig) {}

  async *chat(messages: ChatMessage[], tools?: any[]): AsyncIterable<ChatChunk> {
    const apiKey = this.config.api_key_ref; // In real impl, fetch from secure storage
    const baseUrl = this.config.base_url || 'https://api.openai.com/v1';

    console.log(`OpenAI: Calling ${baseUrl} with model ${this.config.options?.model}`);

    // Mock implementation for scaffold
    yield { content: 'This is a response from the OpenAI provider.', done: false };
    yield { done: true };
  }
}

export class OpenAIProvider implements Provider<ProviderConfig, OpenAIClient> {
  type = 'openai';

  async createClient(config: ProviderConfig): Promise<OpenAIClient> {
    return new OpenAIClient(config);
  }

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    return !!config.api_key_ref;
  }
}
