import { useState } from "react";
import { Send, Mic, Search, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DeepSeekInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onVoiceTranscript?: (transcript: string) => void;
}

export const DeepSeekInput = ({ onSendMessage, disabled, isLoading, onVoiceTranscript }: DeepSeekInputProps) => {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceClick = () => {
    // For now, simulate voice input by providing a sample transcript
    if (onVoiceTranscript) {
      onVoiceTranscript("Hello, I'm using voice input");
    }
  };
  
  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* New Chat Button */}
        <div className="flex justify-center">
          <Button
            variant="default"
            className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:shadow-glow animate-bounce-in"
          >
            New chat
          </Button>
        </div>

        {/* Input Area */}
        <div className="relative">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Stroke AI..."
              disabled={disabled || isLoading}
              className={cn(
                "min-h-[60px] resize-none rounded-2xl border-border bg-secondary/50 px-4 py-4 pr-16 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300",
                "animate-fade-in"
              )}
              rows={1}
            />
          </form>
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between bg-secondary/30 rounded-2xl p-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary/80 transition-all duration-200"
            >
              <Brain size={16} className="text-primary" />
              <span className="text-sm font-medium">DeepThink</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary/80 transition-all duration-200"
            >
              <Search size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">Search</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceClick}
              className="p-3 rounded-full hover:bg-secondary/80 transition-all duration-200"
            >
              <Mic size={18} className="text-muted-foreground" />
            </Button>
            
            <Button 
              type="submit" 
              disabled={!message.trim() || disabled || isLoading}
              onClick={handleSubmit}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-glow"
            >
              <Send size={18} className="text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};