import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const { user, signIn, signUp, resetPassword, updatePassword, signOut } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("signin");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const mode = searchParams.get("mode");

  // Check if we're in password reset mode
  useEffect(() => {
    if (mode === "reset") {
      setCurrentView("updatePassword");
    }
  }, [mode]);

  // Handle hash fragments from email links (Supabase uses hash-based routing for auth)
  useEffect(() => {
    const checkResetMode = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      
      // Check if this is a password recovery link
      if (params.get('type') === 'recovery' || hash.includes('type=recovery')) {
        console.log('Password recovery detected, showing update password form');
        setCurrentView("updatePassword");
        // Clear any existing errors when entering reset mode
        setError("");
      }
    };

    // Check immediately
    checkResetMode();
    
    // Also check after a small delay to catch async auth state changes
    const timeoutId = setTimeout(checkResetMode, 100);
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkResetMode);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', checkResetMode);
    };
  }, []);

  // Check if we're in password reset mode first, before any redirects
  const isPasswordReset = mode === "reset" || 
    window.location.hash.includes('type=recovery') || 
    currentView === "updatePassword";

  // Only redirect if authenticated AND not in password reset mode
  if (user && !isPasswordReset) {
    return <Navigate to="/chat" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    }

    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      });
      // Sign out the user after password update to ensure clean state
      await signOut();
      setCurrentView("signin");
      // Clear the hash to remove recovery tokens
      window.location.hash = "";
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CoopBank Knowledge Assistant</h1>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Your Account</CardTitle>
            <CardDescription>
              Sign in to access the internal knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentView === "updatePassword" ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Set New Password</h3>
                  <p className="text-sm text-muted-foreground">Enter your new password below</p>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      name="confirmPassword"
                      type="password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>
            ) : currentView === "forgotPassword" ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                {resetEmailSent ? (
                  <div className="text-center space-y-4">
                    <Alert>
                      <AlertDescription>
                        Password reset email sent! Check your inbox and follow the instructions to reset your password.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      variant="outline" 
                      onClick={() => {setCurrentView("signin"); setResetEmailSent(false);}}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="your.email@coopbank.com"
                        required
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Email"}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setCurrentView("signin")}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                  </form>
                )}
              </div>
            ) : (
            <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.email@coopbank.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      onClick={() => setCurrentView("forgotPassword")}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your.email@coopbank.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};