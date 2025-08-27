const API_KEYS = [
  "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",
  "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"
];
const GOOGLE_API_KEYS = [
  "AIzaSyDwyny4Ot_1fTxen-7-eZ_I2HX0S-6rmJ8",
  "AIzaSyCKi934Hr-q55qwXYBjyO0wcsJPJluMRZ0",
  "AIzaSyDcxYbOYlTNfMkE-Cqj1C8ihdtdjkD2WDs"
];
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

let currentApiKeyIndex = 0;
let currentGoogleKeyIndex = 0;

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenRouterService {
  private static instance: OpenRouterService;
  
  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }
  
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    return this.sendMessageWithRetry(messages, 0);
  }

  private async sendMessageWithRetry(messages: ChatMessage[], retryCount: number): Promise<string> {
    try {
      const openRouterMessages: OpenRouterMessage[] = [
        {
          role: "system",
          content: "You are Stroke AI, a powerful AI assistant. Provide clear, informative, and engaging responses with sources when possible. Use markdown formatting when appropriate."
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      const currentKey = API_KEYS[currentApiKeyIndex % API_KEYS.length];
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Stroke AI Assistant'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: openRouterMessages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: false
        })
      });
      
      if (!response.ok) {
        // Try next API key if available and retry count is less than total keys
        if (retryCount < API_KEYS.length - 1) {
          currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
          return this.sendMessageWithRetry(messages, retryCount + 1);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`All API keys failed. Last error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from API');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      // Try next API key if available and retry count is less than total keys
      if (retryCount < API_KEYS.length - 1) {
        currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        return this.sendMessageWithRetry(messages, retryCount + 1);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get response from Stroke AI assistant');
    }
  }
}