import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: { title: string; section?: string }[];
  timestamp: string;
}

interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);

  // Create or get chat thread
  useEffect(() => {
    if (user) {
      initializeChatThread();
    }
  }, [user]);

  const initializeChatThread = async () => {
    if (!user) return;

    try {
      // Check if user has existing threads
      const { data: threads, error: threadsError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (threadsError) throw threadsError;

      if (threads && threads.length > 0) {
        // Use existing thread
        setCurrentThread(threads[0]);
        await loadMessages(threads[0].id);
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert([
            {
              user_id: user.id,
              title: 'New Chat'
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setCurrentThread(newThread);
      }
    } catch (error) {
      console.error('Error initializing chat thread:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        type: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
        sources: (msg.metadata as any)?.sources || [],
        timestamp: new Date(msg.created_at!).toLocaleTimeString(),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!user || !currentThread) return;

    setIsLoading(true);
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            thread_id: currentThread.id,
            sender: 'user',
            content: message,
          }
        ]);

      if (userMessageError) throw userMessageError;

      // Simulate assistant response (replace with actual RAG API call)
      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `Thank you for your question: "${message}". This is a simulated response from our knowledge base. In the full implementation, this would connect to your RAG system in Flowise to provide accurate, sourced answers based on your internal documents.`,
          sources: [
            { title: "Employee Handbook", section: "Section 4.2" },
            { title: "Customer Service Guidelines", section: "FAQ #15" }
          ],
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to database
        try {
          const { error: assistantMessageError } = await supabase
            .from('messages')
            .insert([
              {
                thread_id: currentThread.id,
                sender: 'agent',
                content: assistantMessage.content,
                metadata: {
                  sources: assistantMessage.sources
                }
              }
            ]);

          if (assistantMessageError) throw assistantMessageError;

          // Update thread updated_at timestamp
          await supabase
            .from('chat_threads')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', currentThread.id);

        } catch (error) {
          console.error('Error saving assistant message:', error);
        }

        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />
      
      <div className="flex-1 container mx-auto max-w-4xl p-4 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 rounded-lg border bg-card">
          <div className="p-6 space-y-6">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  sources={message.sources}
                  timestamp={message.timestamp}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Assistant is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};