import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Menu, Wand2, Mic } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Sidebar } from "@/components/Sidebar";
import { ActionButtons } from "@/components/ActionButtons";
import { Header } from "@/components/Header";
import { CodePreview } from "@/components/CodePreview";
import { ImageGenerator } from "@/components/ImageGenerator";
import { VoiceRecognition } from "@/components/VoiceRecognition";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenRouterService, ChatMessage as ChatMessageType } from "@/services/openrouter";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useToast } from "@/hooks/use-toast";
import strokeAiLogo from "@/assets/stroke-ai-logo.png";
import strokeAiAvatar from "@/assets/stroke-ai-avatar.png";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
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
        title: "Stroke AI API Error",
        description: "API request failed. Trying backup servers...",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript);
    }
  };

  const handleFeedback = (messageId: string, content: string) => {
    setFeedbackMessage(content);
    setShowFeedback(true);
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
          {/* Show different views based on state */}
          {showPreview ? (
            <CodePreview />
          ) : showImageGenerator ? (
            <ImageGenerator onClose={() => setShowImageGenerator(false)} />
          ) : (
            <>
              {/* Feature Toolbar */}
              <div className="border-b border-border bg-background/50 backdrop-blur-sm p-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden"
                    >
                      <Menu size={18} />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Enhanced AI Features
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageGenerator(true)}
                      className="flex items-center gap-2 hover:shadow-glow transition-bounce"
                    >
                      <Wand2 size={16} />
                      Generate Images
                    </Button>
                  </div>
                </div>
              </div>

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
                          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                            <img 
                              src={strokeAiLogo} 
                              alt="Stroke AI" 
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Welcome to Stroke AI
                          </h2>
                          <p className="text-lg text-muted-foreground mb-2">Your Advanced AI Assistant</p>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                            Ask questions, generate images, use voice commands, and explore endless possibilities with our powerful AI!
                          </p>
                        </div>
                        
                        {/* Voice Recognition Card */}
                        <VoiceRecognition 
                          onTranscript={handleVoiceTranscript}
                          className="max-w-md mx-auto"
                        />
                        
                        <ActionButtons onAction={handleActionClick} />
                      </div>
                    </div>
                   ) : (
                     <div className="flex-1 overflow-y-auto px-4">
                       <div className="max-w-4xl mx-auto py-4">
                         {messages.map((message) => (
                           <ChatMessage 
                             key={message.id} 
                             message={message} 
                             onFeedback={handleFeedback}
                           />
                         ))}
                         {isLoading && <TypingIndicator />}
                         <div ref={messagesEndRef} />
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* Chat Input */}
                 <div className="border-t border-border bg-background p-4">
                   <div className="max-w-4xl mx-auto space-y-3">
                     <div className="flex justify-center mb-2">
                       <Button
                         onClick={handleNewChat}
                         variant="outline"
                         size="sm"
                         className="rounded-full px-6 py-2 text-sm font-medium border-primary/20 hover:border-primary hover:bg-primary/10"
                       >
                         <MessageSquare size={16} className="mr-2" />
                         New chat
                       </Button>
                     </div>
                     
                     {messages.length > 0 && (
                       <VoiceRecognition 
                         onTranscript={handleVoiceTranscript}
                         className="mb-3"
                       />
                     )}
                     <ChatInput 
                       onSendMessage={handleSendMessage}
                       disabled={isLoading}
                       isLoading={isLoading}
                     />
                   </div>
                 </div>
              </main>
            </>
          )}
        </div>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        messageContent={feedbackMessage}
      />
    </div>
  );
};

export default Index;
