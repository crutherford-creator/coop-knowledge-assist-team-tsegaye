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
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto">
          <MessageCircle className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Welcome to COOP Knowledge Assistant</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ask me anything about our policies, procedures, or services. I'm here to help you find the information you need quickly and accurately.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
            <HelpCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground">Expert Guidance</h4>
            <p className="text-xs text-muted-foreground">Get instant answers to your questions</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg">
            <Book className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground">Knowledge Base</h4>
            <p className="text-xs text-muted-foreground">Access to comprehensive policies</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground">24/7 Support</h4>
            <p className="text-xs text-muted-foreground">Available whenever you need help</p>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      {!loading && suggestions.length > 0 && (
        <div className="w-full max-w-2xl space-y-4">
          <h3 className="text-lg font-medium text-foreground">Try asking about:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                className="text-left justify-start h-auto p-4 hover:bg-accent/5 hover:border-accent/20 transition-all duration-200"
                onClick={() => handleSuggestionClick(suggestion.question)}
              >
                <span className="text-sm text-muted-foreground leading-relaxed">{suggestion.question}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Start by typing your question below or click on any suggestion above
        </p>
      </div>
    </div>
  );
};