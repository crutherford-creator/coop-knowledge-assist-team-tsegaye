import { Card } from "@/components/ui/card";
import { MessageSquare, FileSearch, Zap, CheckCircle } from "lucide-react";

export const EmptyState = () => {
  const features = [
    {
      icon: FileSearch,
      title: "Search Knowledge Base",
      description: "Query internal documents and policies instantly"
    },
    {
      icon: MessageSquare,
      title: "Get Sourced Answers",
      description: "Receive answers with document citations"
    },
    {
      icon: Zap,
      title: "Quick Responses",
      description: "Fast, accurate information for customer support"
    },
    {
      icon: CheckCircle,
      title: "Consistent Information",
      description: "Ensure accurate and uniform customer service"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to Knowledge Assistant
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Start by asking a question about our policies, procedures, or support guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 bg-card border-border hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Example questions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "What is our refund policy?",
              "How do I escalate a customer complaint?",
              "What are the SLA requirements?",
              "How to process a return request?"
            ].map((question, index) => (
              <Card key={index} className="px-3 py-2 bg-muted border-border hover:bg-muted/80 transition-colors cursor-pointer">
                <span className="text-xs text-muted-foreground">{question}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};