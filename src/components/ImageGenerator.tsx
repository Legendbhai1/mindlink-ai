import { useState } from "react";
import { Image, Loader2, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextToImageService, GeneratedImage } from "@/services/textToImage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageGeneratorProps {
  onClose: () => void;
}

export const ImageGenerator = ({ onClose }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const textToImageService = TextToImageService.getInstance();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await textToImageService.generateImage({
        prompt: prompt.trim(),
        apiKey: apiKey || undefined,
        width: 512,
        height: 512
      });

      setGeneratedImages(prev => [result, ...prev]);
      toast({
        title: "Image Generated!",
        description: "Your image has been generated successfully.",
      });
    } catch (error) {
      console.error('Image generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `detroitai-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded!",
        description: "Image has been downloaded to your device.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Wand2 size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Image Generator</h2>
            <p className="text-sm text-muted-foreground">Create stunning images with DetroitAI</p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Generation Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image size={20} />
            Generate New Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Image Description
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              API Key (Optional - leave empty for demo mode)
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your image generation API key..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              For better results, add your LimeWire or similar API key
            </p>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full gradient-primary hover:shadow-glow transition-bounce"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Generating Image...
              </>
            ) : (
              <>
                <Wand2 size={18} className="mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Generated Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/512x512/1a1a1a/00ff00?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image.url, image.prompt)}
                      className="opacity-80 hover:opacity-100"
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm text-foreground line-clamp-2">{image.prompt}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    DetroitAI Generated
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};