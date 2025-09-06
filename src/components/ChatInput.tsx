import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { VoiceInterface } from "./VoiceInterface";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  lastResponse?: string;
}

export const ChatInput = ({ onSendMessage, isLoading, value, onChange, lastResponse }: ChatInputProps) => {
  const [message, setMessage] = useState(value || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = value !== undefined ? value : message;
    console.log('Submitting message:', currentMessage);
    if (currentMessage.trim() && !isLoading) {
      onSendMessage(currentMessage.trim());
      setMessage("");
      if (onChange) {
        onChange("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    const cleanText = text.trim();
    setMessage(cleanText);
    if (onChange) {
      onChange(cleanText);
    }
    console.log('Voice transcription received:', cleanText);
  };

  const handlePlayAudio = (text: string) => {
    // This will be handled by the VoiceInterface component
  };

  return (
    <div className="space-y-4">
      <VoiceInterface 
        onTranscription={handleVoiceTranscription}
        onPlayAudio={() => handlePlayAudio(lastResponse || "")}
      />
      
      <Card className="p-4 bg-card border-border shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            value={value !== undefined ? value : message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about our policies or procedures..."
            className="min-h-[80px] resize-none bg-input border-border focus:ring-primary focus:border-primary transition-colors"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!(value !== undefined ? value.trim() : message.trim()) || isLoading}
            className="bg-primary hover:bg-primary-dark text-primary-foreground px-6 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send • Shift + Enter for new line
        </div>
      </Card>
    </div>
  );
};