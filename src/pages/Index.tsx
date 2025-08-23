import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Menu } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Sidebar } from "@/components/Sidebar";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { OpenRouterService, ChatMessage as ChatMessageType } from "@/services/openrouter";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openRouterService = OpenRouterService.getInstance();
  const { toast } = useToast();
  
  const {
    chatHistory,
    currentChatId,
    createNewChat,
    updateChat,
    deleteChat,
    getCurrentChat,
    selectChat,
    setCurrentChatId
  } = useChatHistory();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Load current chat messages when chat changes
  useEffect(() => {
    const currentChat = getCurrentChat();
    if (currentChat) {
      setMessages(currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSendMessage = async (content: string) => {
    // Create new chat if none exists
    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    
    try {
      const response = await openRouterService.sendMessage(newMessages);
      
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Update chat history
      updateChat(chatId, finalMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    setSidebarOpen(false);
  };

  const handleActionClick = (action: string, prompt?: string) => {
    if (prompt) {
      // Pre-fill the input with the prompt - for now just send it directly
      handleSendMessage(prompt);
    }
  };
  
  return (
    <div className="min-h-screen gradient-background flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onDeleteChat={deleteChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu size={18} />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Powered by advanced AI models</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Chat Messages */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl mx-auto space-y-8">
                  <div>
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                      <MessageSquare size={24} className="text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-semibold text-foreground mb-3">What can I help with?</h2>
                  </div>
                  
                  <ActionButtons onAction={handleActionClick} />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
