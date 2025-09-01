import { User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import siiviLogo from "@/assets/siivi-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onTogglePreview: () => void;
  showPreview: boolean;
}

export const Header = ({ onTogglePreview, showPreview }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src={siiviLogo} 
            alt="Siivi"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-gradient-primary">Siivi</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
            className="flex items-center gap-2"
          >
            {showPreview ? <User size={16} /> : <Settings size={16} />}
            {showPreview ? 'Chat' : 'Preview'}
          </Button>
        </div>
      </div>
    </header>
  );
};