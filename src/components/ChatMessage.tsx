import { User, Bot, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import detroitAiAvatar from "@/assets/detroit-ai-avatar.png";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
  onFeedback?: (messageId: string, content: string) => void;
}

export const ChatMessage = ({ message, onFeedback }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 p-4 transition-smooth hover:bg-chat-hover/50 group",
      "animate-in slide-in-from-bottom-2 duration-300"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-smooth overflow-hidden",
        isUser 
          ? "bg-chat-user-bg text-chat-user-text shadow-glow" 
          : "bg-chat-ai-bg text-chat-ai-text border border-border"
      )}>
        {isUser ? (
          <User size={16} />
        ) : (
          <img 
            src={detroitAiAvatar} 
            alt="DetroitAI" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {isUser ? 'You' : 'DetroitAI'}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          {/* Feedback buttons for AI messages */}
          {!isUser && onFeedback && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(message.id, message.content)}
                className="h-6 w-6 p-0 hover:bg-green-500/10 hover:text-green-500"
              >
                <ThumbsUp size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(message.id, message.content)}
                className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500"
              >
                <ThumbsDown size={12} />
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn(
          "prose prose-invert max-w-none text-sm leading-relaxed",
          isUser ? "text-foreground" : "text-chat-ai-text"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </div>
  );
};