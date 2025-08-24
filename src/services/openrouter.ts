const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
    try {
      const openRouterMessages: OpenRouterMessage[] = [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, informative, and engaging responses. Use markdown formatting when appropriate."
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chat Assistant'
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from API');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get response from AI assistant');
    }
  }
}