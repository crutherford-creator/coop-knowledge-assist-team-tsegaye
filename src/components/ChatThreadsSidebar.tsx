import { useState, useEffect } from "react";
import { Plus, MessageSquare, Clock, Hash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_preview?: string;
  message_count?: number;
}

interface ChatThreadsSidebarProps {
  currentThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
  onThreadUpdate?: () => void;
}

export const ChatThreadsSidebar = ({ 
  currentThreadId, 
  onThreadSelect, 
  onNewChat,
  onThreadUpdate 
}: ChatThreadsSidebarProps) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadThreads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_chat_threads', {
          user_uuid: user.id,
          thread_limit: 50
        });

      if (error) throw error;

      setThreads(data || []);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [user]);

  // Refresh threads when a thread is updated
  useEffect(() => {
    if (onThreadUpdate) {
      loadThreads();
    }
  }, [onThreadUpdate]);

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;

      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      // If this was the current thread, create a new one
      if (threadId === currentThreadId) {
        onNewChat();
      }

      toast({
        title: "Thread deleted",
        description: "Chat thread has been removed.",
      });
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast({
        title: "Error",
        description: "Failed to delete thread.",
        variant: "destructive",
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-sidebar-background border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <Button disabled className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Loading...
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-sidebar-accent rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button 
          onClick={onNewChat}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {threads.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-sidebar-accent-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-sidebar-accent-foreground/70">
                No chat history yet.
                <br />
                Start a new conversation!
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <Card
                key={thread.id}
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md group ${
                  currentThreadId === thread.id
                    ? "bg-sidebar-primary/10 border-sidebar-primary"
                    : "bg-sidebar-accent hover:bg-sidebar-accent/80 border-sidebar-border"
                }`}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="space-y-2">
                  {/* Thread Title */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-sidebar-foreground line-clamp-2">
                      {truncateText(thread.title, 40)}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Last Message Preview */}
                  {thread.last_message_preview && (
                    <p className="text-xs text-sidebar-accent-foreground/70 line-clamp-2">
                      {truncateText(thread.last_message_preview, 60)}
                    </p>
                  )}

                  {/* Thread Metadata */}
                  <div className="flex items-center justify-between text-xs text-sidebar-accent-foreground/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(thread.updated_at)}</span>
                    </div>
                    
                    {thread.message_count && thread.message_count > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                        <Hash className="h-2 w-2 mr-1" />
                        {thread.message_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};