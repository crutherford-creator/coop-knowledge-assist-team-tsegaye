import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const ChatInput = ({ onSendMessage, isLoading, value, onChange }: ChatInputProps) => {
  const [message, setMessage] = useState(value || "");
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data:audio/webm;base64, prefix

        // Send to speech-to-text API
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Data }
        });

        if (error) {
          throw error;
        }

        if (data.text && data.text.trim()) {
          const cleanText = data.text.trim();
          console.log('Transcribed text:', cleanText);
          setMessage(cleanText);
          if (onChange) {
            onChange(cleanText);
          }
        } else {
          toast({
            title: "No Speech Detected",
            description: "Could not detect any speech in the recording.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
          placeholder={t('chat.typeMessage')}
          className="min-h-[80px] resize-none bg-input border-border focus:ring-primary focus:border-primary transition-colors"
          disabled={isLoading || isListening || isProcessing}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading || isProcessing}
            variant={isListening ? "destructive" : "outline"}
            className="px-4 transition-all duration-200"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="submit"
            disabled={!(value !== undefined ? value.trim() : message.trim()) || isLoading || isListening || isProcessing}
            className="bg-primary hover:bg-primary-dark text-primary-foreground px-4 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      <div className="mt-2 text-xs text-muted-foreground">
        {isListening ? "🎤 Listening... Click stop when done" : "Press Enter to send • Shift + Enter for new line"}
      </div>
    </Card>
  );
};