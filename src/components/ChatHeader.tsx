import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Shield, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ChatHeader = () => {
  const { signOut, user } = useAuth();
  
  const handleSignOut = () => {
    signOut();
  };

  return (
    <Card className="p-6 bg-gradient-primary text-primary-foreground border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Knowledge Assistant</h1>
            <p className="text-primary-foreground/80 text-sm">
              Welcome, {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
            <Shield className="h-3 w-3 mr-1" />
            Internal Use Only
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
            <Clock className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-white/20 ml-2"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
        <p className="text-sm text-primary-foreground/90 leading-relaxed">
          Ask questions about policies, procedures, and customer support guidelines. 
          I'll search our internal knowledge base and provide accurate, sourced answers to help you assist customers effectively.
        </p>
      </div>
    </Card>
  );
};