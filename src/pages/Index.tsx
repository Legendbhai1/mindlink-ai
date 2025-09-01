import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Menu, Wand2, Mic } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Sidebar } from "@/components/Sidebar";
import { ActionButtons } from "@/components/ActionButtons";
import { Header } from "@/components/Header";
import { CodePreview } from "@/components/CodePreview";

import { ChatInterface } from "@/components/ChatInterface";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenRouterService, ChatMessage as ChatMessageType } from "@/services/openrouter";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import siiviLogo from "@/assets/siivi-logo-new.png";
import siiviAvatar from "@/assets/siivi-avatar-new.png";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { settings, translate, getPersonalityPrompt } = useSettings();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse">
            <img 
              src={siiviLogo} 
              alt="Siivi" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <p className="text-muted-foreground">Loading Siivi...</p>
        </div>
      </div>
    );
  }
  
  // Don't render if not authenticated
  if (!user) {
    return null;
  }
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
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
      const response = await openRouterService.sendMessage(newMessages, {
        model: settings.ai_model,
        temperature: settings.ai_temperature,
        personality: getPersonalityPrompt()
      });
      
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
        title: "Siivi API Error",
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

        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onVoiceTranscript={handleVoiceTranscript}
            onFeedback={handleFeedback}
            onNewChat={handleNewChat}
            onActionClick={handleActionClick}
            apiError={apiError}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
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
