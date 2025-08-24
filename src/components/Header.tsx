import { Code, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import detroitAiLogo from "@/assets/detroit-ai-logo.png";

interface HeaderProps {
  onTogglePreview: () => void;
  showPreview: boolean;
}

export const Header = ({ onTogglePreview, showPreview }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src={detroitAiLogo} 
            alt="DetroitAI" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">DetroitAI</h1>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="flex items-center gap-2"
        >
          {showPreview ? <MessageSquare size={16} /> : <Code size={16} />}
          {showPreview ? 'Chat' : 'Preview'}
        </Button>
      </div>
    </header>
  );
};