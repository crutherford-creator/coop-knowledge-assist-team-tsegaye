import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { ChatThreadsSidebar } from "@/components/ChatThreadsSidebar";
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
  const [shouldRefreshThreads, setShouldRefreshThreads] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [lastResponse, setLastResponse] = useState("");

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

      if (threadsError) {
        console.error('Error fetching threads:', threadsError);
        throw threadsError;
      }

      if (threads && threads.length > 0) {
        // Use existing thread
        const existingThread = threads[0];
        setCurrentThread(existingThread);
        await loadMessages(existingThread.id);
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

        if (createError) {
          console.error('Error creating thread:', createError);
          throw createError;
        }
        
        setCurrentThread(newThread);
      }
    } catch (error) {
      console.error('Error initializing chat thread:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please refresh the page and try again.",
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

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

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
      toast({
        title: "Error",
        description: "Failed to load chat history. Some messages may not be visible.",
        variant: "destructive",
      });
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

      // Call Flowise RAG system via edge function
      const { data: ragResponse, error: ragError } = await supabase.functions.invoke(
        'chat-with-rag',
        {
          body: {
            question: message,
            threadId: currentThread.id
          }
        }
      );

      if (ragError) {
        console.error('RAG API error:', ragError);
        // Fallback response if RAG fails
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I apologize, but I'm experiencing technical difficulties accessing our knowledge base. Please try again in a moment, or contact your supervisor if the issue persists.",
          sources: [],
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: ragResponse.answer,
        sources: ragResponse.sources || [],
        timestamp: new Date().toLocaleTimeString(),
      };

      // Save assistant response to database
      await supabase
        .from('messages')
        .insert({
          thread_id: currentThread.id,
          content: assistantMessage.content,
          sender: 'agent',
          metadata: ragResponse.sources ? { sources: ragResponse.sources } : null
        });

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(assistantMessage.content);
      
      // Update thread updated_at timestamp and trigger sidebar refresh
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentThread.id);
        
      setShouldRefreshThreads(prev => prev + 1);
      setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the user message from UI if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error processing your message. Please try again. If the problem persists, please contact your supervisor.",
        sources: [],
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  const handleThreadSelect = async (threadId: string) => {
    try {
      // Fetch the selected thread
      const { data: thread, error: threadError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      setCurrentThread(thread);
      await loadMessages(threadId);
    } catch (error) {
      console.error('Error loading thread:', error);
      toast({
        title: "Error",
        description: "Failed to load chat thread.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = async () => {
    try {
      // Create new thread
      const { data: newThread, error: createError } = await supabase
        .from('chat_threads')
        .insert({
          user_id: user?.id,
          title: 'New Chat',
        })
        .select()
        .single();

      if (createError) throw createError;

      setCurrentThread(newThread);
      setMessages([]);
      setShouldRefreshThreads(prev => prev + 1);
    } catch (error) {
      console.error('Error creating new thread:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ChatHeader />
      
      <div className="flex-1 flex min-h-0">
        <ChatThreadsSidebar
          currentThreadId={currentThread?.id}
          onThreadSelect={handleThreadSelect}
          onNewChat={handleNewChat}
          onThreadUpdate={() => setShouldRefreshThreads(prev => prev + 1)}
        />
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 gap-4 min-h-0">
            <ScrollArea className="flex-1 rounded-lg border bg-card min-h-0">
              <div className="p-6 space-y-6">
                {messages.length === 0 ? (
                  <EmptyState onSuggestionClick={setInputValue} />
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
            
            <div className="flex-shrink-0">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading}
                value={inputValue}
                onChange={setInputValue}
                lastResponse={lastResponse}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};