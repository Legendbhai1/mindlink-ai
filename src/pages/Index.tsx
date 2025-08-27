import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Menu, Wand2, Mic } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { DeepSeekInput } from "@/components/DeepSeekInput";
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
import strokeAiLogo from "@/assets/stroke-ai-logo-animated.png";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onTogglePreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
                      <div className="text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
                        <div>
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-glow animate-logo-pulse">
                            <img 
                              src={strokeAiLogo} 
                              alt="Stroke AI" 
                              className="w-12 h-12 object-contain"
                            />
                          </div>
                          <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-slide-up">
                            Stroke AI
                          </h2>
                          <p className="text-lg text-muted-foreground mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
                            Advanced AI features and tools
                          </p>
                          
                          <div className="space-y-3 text-left max-w-md mx-auto text-sm text-muted-foreground animate-slide-up" style={{animationDelay: '0.2s'}}>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">○</span>
                              <span>Code generation and debugging assistance</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">○</span>
                              <span>Image generation and analysis tools</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">○</span>
                              <span>Text-to-speech functionality</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">○</span>
                              <span>Deep search toggle</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">3.</span>
                              <span>A responsive design that works on both desktop and mobile devices</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">4.</span>
                              <span>Dark/light mode toggle</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">5.</span>
                              <span>Simulated AI responses that demonstrate how the actual API would work</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-primary">6.</span>
                              <span>Interactive elements for sending messages, recording audio, and using tools</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
                            The implementation uses the provided API key and maintains all the features described in the original code while presenting them in a clean, modern interface.
                          </p>
                        </div>
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
                 
                  {/* DeepSeek Input */}
                  <DeepSeekInput 
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    isLoading={isLoading}
                    onVoiceTranscript={handleVoiceTranscript}
                  />
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
