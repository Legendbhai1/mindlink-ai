import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const projectFiles = [
  { name: "App.tsx", content: `// React Chat Application
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const App = () => (
  <BrowserRouter>
    <Toaster />
    <Routes>
      <Route path="/" element={<Index />} />
    </Routes>
  </BrowserRouter>
);

export default App;` },
  { name: "pages/Index.tsx", content: `// Main chat interface
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
// ... rest of chat implementation` },
  { name: "components/ChatMessage.tsx", content: `// Individual chat message component
import { User } from "lucide-react";
import detroitAiAvatar from "@/assets/detroit-ai-avatar.png";

export const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className="flex gap-3 p-4">
      {/* Avatar and message content */}
    </div>
  );
};` }
];

export const CodePreview = () => {
  const [selectedFile, setSelectedFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* File explorer */}
      <div className="w-64 border-r border-border bg-muted/50">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Project Files</h3>
        </div>
        <div className="p-2">
          {projectFiles.map((file, index) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(index)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedFile === index
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code viewer */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-medium text-foreground">
            {projectFiles[selectedFile].name}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(projectFiles[selectedFile].content)}
            className="flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <pre className="p-4 text-sm font-mono text-foreground bg-background">
            <code>{projectFiles[selectedFile].content}</code>
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};