import { Menu, RotateCcw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import strokeAiLogo from "@/assets/stroke-ai-logo-animated.png";

interface HeaderProps {
  onTogglePreview: () => void;
  showPreview: boolean;
  onToggleSidebar?: () => void;
}

export const Header = ({ onTogglePreview, showPreview, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-background border-b border-border px-4 py-3 animate-slide-up">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-secondary/80 transition-all duration-200"
          >
            <Menu size={20} className="text-muted-foreground" />
          </Button>
        </div>
        
        <Button
          variant="outline"  
          size="sm"
          className="flex items-center gap-2 px-4 py-2 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          <Smartphone size={16} />
          Get App
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePreview}
          className="p-2 hover:bg-secondary/80 transition-all duration-200"
        >
          <RotateCcw size={20} className="text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};