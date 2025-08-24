import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Menu } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Sidebar } from "@/components/Sidebar";
import { ActionButtons } from "@/components/ActionButtons";
import { Header } from "@/components/Header";
import { CodePreview } from "@/components/CodePreview";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenRouterService, ChatMessage as ChatMessageType } from "@/services/openrouter";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useToast } from "@/hooks/use-toast";
import detroitAiLogo from "@/assets/detroit-ai-logo.png";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
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
    // Clear any previous API errors
    setApiError(null);
    
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
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      
      // Show both toast and persistent error
      setApiError(errorMessage);
      toast({
        title: "DetroitAI API Error",
        description: "API request failed. Check your connection and try again.",
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
    <div className="min-h-screen gradient-background flex flex-col">
      <Header 
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
      />
      
      <div className="flex flex-1 overflow-hidden">
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
          {/* Show preview or chat */}
          {showPreview ? (
            <CodePreview />
          ) : (
            <>
              {/* API Error Alert */}
              {apiError && (
                <Alert variant="destructive" className="m-4 mb-0">
                  <AlertDescription>
                    {apiError}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Chat Messages */}
              <main className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center max-w-2xl mx-auto space-y-8">
                        <div>
                          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                            <img 
                              src={detroitAiLogo} 
                              alt="DetroitAI" 
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <h2 className="text-3xl font-semibold text-foreground mb-3">What can DetroitAI help with?</h2>
                          <p className="text-muted-foreground">Ask questions, get help with coding, or start a conversation!</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
