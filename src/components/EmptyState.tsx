import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, HelpCircle, Book, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  id: string;
  question: string;
  category?: string;
  display_order: number;
}

interface EmptyStateProps {
  onSuggestionClick?: (question: string) => void;
}

export const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading suggestions:', error);
        return;
      }

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(question);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-4 max-sm:space-y-4 max-sm:p-3">
      {/* Header Section */}
      <div className="space-y-3 max-sm:space-y-2">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto max-sm:w-12 max-sm:h-12">
          <MessageCircle className="h-8 w-8 text-primary max-sm:h-6 max-sm:w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground max-lg:text-xl max-sm:text-lg">Welcome to COOP Knowledge Assistant</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed max-sm:text-sm max-sm:max-w-sm">
            Ask me anything about our policies, procedures, or services. I'm here to help you find the information you need quickly and accurately.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl max-sm:gap-3">
        <div className="flex flex-col items-center space-y-2 text-center max-sm:space-y-1">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg max-sm:w-8 max-sm:h-8">
            <HelpCircle className="h-5 w-5 text-accent max-sm:h-4 max-sm:w-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground max-sm:text-xs">Expert Guidance</h4>
            <p className="text-xs text-muted-foreground max-sm:text-[10px]">Get instant answers to your questions</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 text-center max-sm:space-y-1">
          <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg max-sm:w-8 max-sm:h-8">
            <Book className="h-5 w-5 text-secondary max-sm:h-4 max-sm:w-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground max-sm:text-xs">Knowledge Base</h4>
            <p className="text-xs text-muted-foreground max-sm:text-[10px]">Access to comprehensive policies</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 text-center max-sm:space-y-1 md:col-span-1 max-md:col-span-1">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg max-sm:w-8 max-sm:h-8">
            <Users className="h-5 w-5 text-accent max-sm:h-4 max-sm:w-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground max-sm:text-xs">24/7 Support</h4>
            <p className="text-xs text-muted-foreground max-sm:text-[10px]">Available whenever you need help</p>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      {!loading && suggestions.length > 0 && (
        <div className="w-full max-w-2xl space-y-3 max-sm:space-y-2">
          <h3 className="text-lg font-medium text-foreground max-sm:text-base">Try asking about:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-sm:gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 max-sm:p-2"
                onClick={() => handleSuggestionClick(suggestion.question)}
              >
                <span className="text-sm text-muted-foreground leading-relaxed max-sm:text-xs">{suggestion.question}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground max-sm:text-xs">
          Start by typing your question below or click on any suggestion above
        </p>
      </div>
    </div>
  );
};