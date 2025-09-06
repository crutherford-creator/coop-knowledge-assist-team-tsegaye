import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onPlayAudio: (text: string) => void;
  isListening?: boolean;
  isPlaying?: boolean;
}

export const VoiceInterface = ({ 
  onTranscription, 
  onPlayAudio, 
  isListening: externalIsListening,
  isPlaying: externalIsPlaying 
}: VoiceInterfaceProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const finalIsListening = externalIsListening ?? isListening;
  const finalIsPlaying = externalIsPlaying ?? isPlaying;

  useEffect(() => {
    // Create audio element for TTS playback
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
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
          onTranscription(cleanText);
          toast({
            title: "Speech Recognized",
            description: `"${cleanText}"`,
          });
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

  const playAudio = async (text: string) => {
    if (!text) return;
    
    setIsPlaying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: 'alloy' // You can make this configurable
        }
      });

      if (error) {
        throw error;
      }

      if (audioRef.current && data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        
        // Clean up URL after playback
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to generate or play audio.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={finalIsListening ? stopListening : startListening}
            disabled={isProcessing || finalIsPlaying}
            variant={finalIsListening ? "destructive" : "default"}
            size="lg"
            className="rounded-full h-16 w-16 relative"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
            ) : finalIsListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
            
            {finalIsListening && (
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            {isProcessing ? "Processing..." : finalIsListening ? "Stop Recording" : "Start Recording"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={() => onPlayAudio}
            disabled={finalIsListening || isProcessing}
            variant={finalIsPlaying ? "destructive" : "outline"}
            size="lg"
            className="rounded-full h-16 w-16"
          >
            {finalIsPlaying ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            {finalIsPlaying ? "Stop Audio" : "Play Last Response"}
          </span>
        </div>
      </div>
      
      {finalIsListening && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            🎤 Listening... Speak now
          </p>
        </div>
      )}
    </Card>
  );
};