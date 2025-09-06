import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Clock, Users, BookOpen, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";

export const Landing = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 max-sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 max-sm:gap-1">
            <div className="p-2 bg-white/20 rounded-lg max-sm:p-1">
              <MessageCircle className="h-6 w-6 text-white max-sm:h-5 max-sm:w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white max-sm:text-lg">{t('app.title')}</h1>
              <p className="text-white/80 text-sm max-sm:text-xs max-sm:hidden">{t('app.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/chat">
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 max-sm:text-sm max-sm:px-3">
                    Go to Chat
                  </Button>
                </Link>
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 max-sm:text-sm max-sm:px-3"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 max-sm:text-sm max-sm:px-3">
                  {t('auth.signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-4 max-sm:py-3 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 max-sm:mb-3 max-sm:text-xs">
            <Shield className="h-3 w-3 mr-1 max-sm:h-2 max-sm:w-2" />
            {t('landing.internalUse')}
          </Badge>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight max-lg:text-4xl max-md:text-3xl max-sm:text-2xl max-sm:mb-4">
            {t('landing.heroTitle')}<br />
            <span className="text-white">{t('landing.heroSubtitle')}</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto max-lg:text-lg max-md:text-base max-sm:text-sm max-sm:mb-6 max-sm:px-4">
            {t('landing.heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-sm:mb-8 max-sm:gap-3">
            <Link to={user ? "/chat" : "/auth"}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 text-lg max-sm:w-full max-sm:text-base max-sm:py-3">
                {t('landing.getStarted')}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-4 text-lg max-sm:w-full max-sm:text-base max-sm:py-3"
            >
              {t('landing.learnMore')}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-sm:mt-8 max-sm:gap-4">
            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm max-sm:p-4">
              <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
                <div className="p-2 bg-white/20 rounded-lg max-sm:p-1.5">
                  <Zap className="h-5 w-5 text-white max-sm:h-4 max-sm:w-4" />
                </div>
                <h3 className="font-semibold text-white max-sm:text-sm">{t('landing.features.instantAnswers.title')}</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-sm:text-xs">
                {t('landing.features.instantAnswers.description')}
              </p>
            </Card>

            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm max-sm:p-4">
              <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
                <div className="p-2 bg-white/20 rounded-lg max-sm:p-1.5">
                  <BookOpen className="h-5 w-5 text-white max-sm:h-4 max-sm:w-4" />
                </div>
                <h3 className="font-semibold text-white max-sm:text-sm">{t('landing.features.policyGuidance.title')}</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-sm:text-xs">
                {t('landing.features.policyGuidance.description')}
              </p>
            </Card>

            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm max-sm:p-4">
              <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
                <div className="p-2 bg-white/20 rounded-lg max-sm:p-1.5">
                  <Users className="h-5 w-5 text-white max-sm:h-4 max-sm:w-4" />
                </div>
                <h3 className="font-semibold text-white max-sm:text-sm">{t('landing.features.teamEfficiency.title')}</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-sm:text-xs">
                {t('landing.features.teamEfficiency.description')}
              </p>
            </Card>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 max-sm:mt-6 max-sm:gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 max-sm:text-xs">
              <Clock className="h-3 w-3 mr-1 max-sm:h-2 max-sm:w-2" />
              {t('landing.status.realTimeUpdates')}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 max-sm:text-xs">
              <Shield className="h-3 w-3 mr-1 max-sm:h-2 max-sm:w-2" />
              {t('landing.status.secureAccess')}
            </Badge>
          </div>

          {/* Company Logo */}
          <div className="flex justify-center mt-8 max-sm:mt-6">
            <img 
              src="/lovable-uploads/258f867f-85c8-4ed1-8679-27c9fa62bd5c.png" 
              alt={t('landing.companyName')} 
              className="h-12 w-auto opacity-80 max-sm:h-10"
            />
          </div>
        </div>
      </main>
    </div>
  );
};