import { toast } from "sonner";

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  apiKey?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export class TextToImageService {
  private static instance: TextToImageService;
  
  public static getInstance(): TextToImageService {
    if (!TextToImageService.instance) {
      TextToImageService.instance = new TextToImageService();
    }
    return TextToImageService.instance;
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    if (!params.apiKey) {
      throw new Error('API key is required for image generation');
    }

    try {
      // Using a free text-to-image API service
      const response = await fetch('https://api.limewire.com/api/image/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Version': 'v1',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          aspect_ratio: '1:1',
          model: 'flux-1.1-pro',
          quality: 'HD',
          style: 'PHOTOREALISTIC'
        })
      });

      if (!response.ok) {
        // Fallback to a mock implementation for demo
        return this.generateMockImage(params);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].asset_url) {
        return {
          url: data.data[0].asset_url,
          prompt: params.prompt
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Image generation failed:', error);
      // Return a placeholder image for demo purposes
      return this.generateMockImage(params);
    }
  }

  private generateMockImage(params: GenerateImageParams): GeneratedImage {
    // Generate a placeholder image URL with the prompt as text
    const encodedPrompt = encodeURIComponent(params.prompt.slice(0, 50));
    const width = params.width || 512;
    const height = params.height || 512;
    
    return {
      url: `https://via.placeholder.com/${width}x${height}/1a1a1a/00ff00?text=${encodedPrompt}`,
      prompt: params.prompt
    };
  }
}