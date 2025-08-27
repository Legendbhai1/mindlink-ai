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
          model: 'openrouter/auto',
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
        // Try next OpenRouter API key; otherwise fall back to Google Gemini
        if (retryCount < API_KEYS.length - 1) {
          currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
          return this.sendMessageWithRetry(messages, retryCount + 1);
        } else {
          return this.sendViaGoogle(messages, 0);
        }
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from API');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      // Try next OpenRouter API key; otherwise fall back to Google Gemini
      if (retryCount < API_KEYS.length - 1) {
        currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        return this.sendMessageWithRetry(messages, retryCount + 1);
      }
      // Fall back to Google Gemini
      return this.sendViaGoogle(messages, 0);
    }
  }

  private async sendViaGoogle(messages: ChatMessage[], retryCount: number): Promise<string> {
    try {
      const systemPrompt = "You are Stroke AI, a powerful AI assistant. Provide clear, informative, and engaging responses with sources when possible. Use markdown formatting when appropriate.";
      const contents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      ];

      const key = GOOGLE_API_KEYS[currentGoogleKeyIndex % GOOGLE_API_KEYS.length];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        if (retryCount < GOOGLE_API_KEYS.length - 1) {
          currentGoogleKeyIndex = (currentGoogleKeyIndex + 1) % GOOGLE_API_KEYS.length;
          return this.sendViaGoogle(messages, retryCount + 1);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Gemini failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid response structure from Google Gemini');
      }
      return text;
    } catch (err) {
      console.error('Google Gemini API Error:', err);
      if (retryCount < GOOGLE_API_KEYS.length - 1) {
        currentGoogleKeyIndex = (currentGoogleKeyIndex + 1) % GOOGLE_API_KEYS.length;
        return this.sendViaGoogle(messages, retryCount + 1);
      }
      if (err instanceof Error) throw err;
      throw new Error('Failed to get response from Stroke AI assistant via Google Gemini');
    }
  }
}
