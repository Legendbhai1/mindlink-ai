import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeechRecognitionService, SpeechRecognitionResult } from "@/services/speechRecognition";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceRecognition = ({ onTranscript, className }: VoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [speechService] = useState(() => new SpeechRecognitionService());
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(speechService.isSupported());
    if (!speechService.isSupported()) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
    }
  }, [speechService, toast]);

  const handleStartListening = () => {
    if (!isSupported) return;

    const success = speechService.startListening(
      (result: SpeechRecognitionResult) => {
        setTranscript(result.transcript);
        
        if (result.isFinal && result.transcript.trim()) {
          onTranscript(result.transcript.trim());
          setTranscript("");
        }
      },
      (error: string) => {
        toast({
          title: "Voice Recognition Error",
          description: `Failed to recognize speech: ${error}`,
          variant: "destructive",
        });
        setIsListening(false);
      }
    );

    if (success) {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now. DetroitAI is listening to your voice.",
      });
    }
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    setTranscript("");
  };

  const toggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  if (!isSupported) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="p-4 text-center">
          <Volume2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Voice recognition not supported in this browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-smooth", isListening && "border-primary shadow-glow", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-foreground" />
            <span className="text-sm font-medium text-foreground">Voice Input</span>
          </div>
          <Badge variant={isListening ? "default" : "secondary"} className="text-xs">
            {isListening ? "Listening" : "Ready"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className={cn(
              "flex-shrink-0 transition-bounce",
              isListening && "animate-pulse"
            )}
          >
            {isListening ? (
              <>
                <MicOff size={16} className="mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic size={16} className="mr-2" />
                Start
              </>
            )}
          </Button>

          <div className="flex-1 min-h-[24px] flex items-center">
            {transcript && (
              <p className="text-sm text-foreground italic animate-pulse">
                "{transcript}"
              </p>
            )}
            {isListening && !transcript && (
              <p className="text-xs text-muted-foreground animate-pulse">
                Listening for your voice...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};