import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Shield, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const ChatHeader = () => {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  
  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="p-4 bg-gradient-primary text-primary-foreground shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/258f867f-85c8-4ed1-8679-27c9fa62bd5c.png" 
            alt="Cooperative Bank of Oromia" 
            className="h-6 w-auto max-sm:h-5"
          />
          <div className="p-2 bg-white/20 rounded-lg max-sm:hidden">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold max-sm:text-base">{t('app.title')}</h1>
            <p className="text-primary-foreground/80 text-xs max-sm:hidden">
              {t('chat.welcome')}, {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30 max-sm:hidden">
            <Shield className="h-3 w-3 mr-1" />
            {t('chat.internalUse')}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 max-sm:mr-0 sm:mr-1" />
            <span className="max-sm:hidden">{t('chat.signOut')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};