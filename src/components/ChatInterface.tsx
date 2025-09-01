import { useState, useRef, useEffect } from "react";
import { MessageSquare, Menu } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ActionButtons } from "@/components/ActionButtons";
import { VoiceRecognition } from "@/components/VoiceRecognition";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenRouterService, ChatMessage as ChatMessageType } from "@/services/openrouter";
import { useSettings } from "@/hooks/useSettings";
import siiviLogo from "@/assets/siivi-logo-new.png";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onVoiceTranscript: (transcript: string) => void;
  onFeedback: (messageId: string, content: string) => void;
  onNewChat: () => void;
  onActionClick: (action: string, prompt?: string) => void;
  apiError: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const ChatInterface = ({
  messages,
  isLoading,
  onSendMessage,
  onVoiceTranscript,
  onFeedback,
  onNewChat,
  onActionClick,
  apiError,
  sidebarOpen,
  onToggleSidebar
}: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { translate } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
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
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <img 
                      src={siiviLogo} 
                      alt="Siivi" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {translate('welcome')}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-3">{translate('tagline')}</p>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {translate('description')}
                  </p>
                </div>
                
                {/* Voice Recognition Card */}
                <VoiceRecognition 
                  onTranscript={onVoiceTranscript}
                  className="max-w-md mx-auto"
                />
                
                <ActionButtons onAction={onActionClick} />
              </div>
            </div>
           ) : (
             <div className="flex-1 overflow-y-auto px-4">
               <div className="max-w-4xl mx-auto py-6">
                 {messages.map((message) => (
                   <ChatMessage 
                     key={message.id} 
                     message={message} 
                     onFeedback={onFeedback}
                   />
                 ))}
                 {isLoading && <TypingIndicator />}
                 <div ref={messagesEndRef} />
               </div>
             </div>
           )}
         </div>
         
         {/* Chat Input */}
         <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
           <div className="max-w-4xl mx-auto space-y-4">
             <div className="flex justify-center mb-2">
               <Button
                 onClick={onNewChat}
                 variant="outline"
                 size="sm"
                 className="rounded-full px-6 py-2 text-sm font-medium border-primary/20 hover:border-primary hover:bg-primary/10 transition-smooth"
               >
                 <MessageSquare size={16} className="mr-2" />
                 New chat
               </Button>
             </div>
             
             {messages.length > 0 && (
               <VoiceRecognition 
                 onTranscript={onVoiceTranscript}
                 className="mb-3"
               />
             )}
             <ChatInput 
               onSendMessage={onSendMessage}
               disabled={isLoading}
               isLoading={isLoading}
             />
           </div>
         </div>
      </main>
    </>
  );
};