import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageContent?: string;
}

export const FeedbackModal = ({ isOpen, onClose, messageContent }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate feedback submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve DetroitAI.",
      });
      
      // Reset form
      setRating(0);
      setFeedback("");
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Star className="text-primary" size={20} />
            Feedback for DetroitAI
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {messageContent && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Response:</p>
              <p className="text-sm line-clamp-3">{messageContent}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              How would you rate this response?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={cn(
                    "p-1 transition-colors",
                    star <= rating ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                  )}
                >
                  <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think or how we can improve..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 gradient-primary hover:shadow-glow transition-bounce"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};