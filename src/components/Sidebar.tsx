import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  BookOpen, 
  Grid3X3, 
  Menu,
  X,
  ChevronDown,
  Edit3,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: any[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  onDeleteChat: (chatId: string) => void;
}

export const Sidebar = ({ 
  isOpen, 
  onToggle, 
  currentChatId, 
  onSelectChat, 
  onNewChat, 
  chatHistory,
  onDeleteChat 
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out",
        "w-80 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <MessageSquare size={18} className="text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X size={18} />
              </Button>
            </div>
            
            {/* New Chat Button */}
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={16} />
              New chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <BookOpen size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">Library</span>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Grid3X3 size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">GPTs</span>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChevronDown size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recent Chats
                </span>
              </div>
              
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors relative",
                      currentChatId === chat.id 
                        ? "bg-muted text-foreground" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare size={14} className="flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{chat.title}</span>
                    
                    {/* Chat Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted-foreground/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality can be added later
                        }}
                      >
                        <Edit3 size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredChats.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No chats found" : "No chat history yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              ✨ Upgrade
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};