import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Bot, FileText } from "lucide-react";
import { StreamingText } from "./StreamingText";

interface Source {
  title: string;
  section?: string;
}

interface ChatMessageProps {
  type: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp?: string;
  isStreaming?: boolean;
  onStreamComplete?: () => void;
}

export const ChatMessage = ({ type, content, sources, timestamp, isStreaming = false, onStreamComplete }: ChatMessageProps) => {
  const isUser = type === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      {!isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        <Card className={`p-4 ${
          isUser 
            ? "bg-chat-user-bg text-chat-user-text border-primary/20" 
            : "bg-chat-assistant-bg text-chat-assistant-text border-border"
        } shadow-sm transition-all duration-200 hover:shadow-md`}>
          {type === "assistant" && isStreaming ? (
            <StreamingText 
              text={content} 
              speed={20}
              isStreaming={isStreaming}
              onComplete={onStreamComplete}
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          )}
        </Card>
        
        {timestamp && (
          <div className={`text-xs text-muted-foreground mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}>
            {timestamp}
          </div>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 border-2 border-muted">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};