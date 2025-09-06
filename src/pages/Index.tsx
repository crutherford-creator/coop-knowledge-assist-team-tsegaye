import { useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: { title: string; section?: string }[];
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call to knowledge base
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I'm unable to find an authoritative answer in our documents for "${content}". Please escalate to the supervisor.

However, if this were a real knowledge base query, I would search through our internal policy documents, PDFs, and knowledge base to provide you with accurate, sourced information to help you assist customers effectively.

This response would include:
- Specific policy references
- Step-by-step procedures
- Relevant document citations
- Consistent guidance aligned with company standards`,
        sources: [
          { title: "Policy Doc #3", section: "Section 2.1" },
          { title: "Support Guidelines", section: "Customer Service Standards" }
        ],
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  sources={message.sources}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <ChatMessage
                  type="assistant"
                  content="Searching knowledge base..."
                  timestamp="Processing"
                />
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="p-6 pt-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
