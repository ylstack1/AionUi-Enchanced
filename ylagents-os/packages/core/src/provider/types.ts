/**
 * BYOK Provider Interfaces
 */

export interface ProviderConfig {
  id: string;
  type: string;
  name: string;
  base_url?: string;
  api_key_ref?: string;
  options?: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatChunk {
  content?: string;
  tool_calls?: any[];
  done: boolean;
}

export interface LLMClient {
  chat(messages: ChatMessage[], tools?: any[]): AsyncIterable<ChatChunk>;
  listModels?(): Promise<string[]>;
}

/**
 * The base interface for all external service providers.
 */
export interface Provider<TConfig = ProviderConfig, TClient = any> {
  type: string;
  createClient(config: TConfig): Promise<TClient>;
  validateConfig(config: TConfig): Promise<boolean>;
}
