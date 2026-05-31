export type AIProviderId = "gemini" | "openai" | "ollama";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface EmbeddingOptions {
  input: string | string[];
}

export interface AIProvider {
  id: AIProviderId;
  chat(options: ChatCompletionOptions): Promise<string>;
  chatStream?(options: ChatCompletionOptions): AsyncIterable<string>;
  embed(options: EmbeddingOptions): Promise<number[][]>;
}
