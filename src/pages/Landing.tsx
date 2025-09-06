import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Clock, Users, BookOpen, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CoopBank Knowledge Assistant</h1>
              <p className="text-white/80 text-sm">Internal Support Staff Tool</p>
            </div>
          </div>
          
          <Link to="/auth">
            <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            <Shield className="h-3 w-3 mr-1" />
            Internal Use Only
          </Badge>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Your Intelligent<br />
            <span className="text-accent">Knowledge Companion</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            Access our comprehensive internal knowledge base instantly. Get accurate, 
            sourced answers to help you assist customers effectively and efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg">
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Instant Answers</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Get immediate responses from our comprehensive knowledge base with source citations.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Policy Guidance</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Access up-to-date policies, procedures, and customer support guidelines.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Team Efficiency</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Empower your team with consistent, accurate information for better customer service.
              </p>
            </Card>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="h-3 w-3 mr-1" />
              Real-time Updates
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Shield className="h-3 w-3 mr-1" />
              Secure Access
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
};