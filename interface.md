# User Interface Documentation: CoopBank of Oromia Chatbot

## Design System & Branding

### Color Palette
```css
:root {
  /* Primary brand colors */
  --primary: 199 100% 47%; /* #00adef - CoopBank Blue */
  --secondary: 0 0% 0%; /* #000000 - Black */
  --accent: 23 84% 53%; /* #e38524 - Orange */
  
  /* UI Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 199 100% 47%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
}
```

### Typography
- **Primary Font**: Inter (clean, modern, readable)
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight, high contrast
- **Button Text**: Medium weight

## Page Components

### 1. Landing Page (`/`)

#### Header Component
```tsx
// Main navigation header
<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center justify-between">
    {/* Logo and Title */}
    <div className="flex items-center gap-4">
      <img src="/logo.png" alt="CoopBank of Oromia" className="h-10 w-10" />
      <div>
        <h1 className="text-xl font-bold text-primary">CoopBank of Oromia</h1>
        <p className="text-sm text-muted-foreground">Customer Support Assistant</p>
      </div>
    </div>
    
    {/* Navigation */}
    <div className="flex items-center gap-4">
      <LanguageSwitcher />
      {user ? (
        <>
          <Button variant="outline" asChild>
            <Link to="/chat">Go to Chat</Link>
          </Button>
          <Button variant="ghost" onClick={signOut}>Sign Out</Button>
        </>
      ) : (
        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      )}
    </div>
  </div>
</header>
```

#### Hero Section
```tsx
<section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
  <div className="container mx-auto text-center">
    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      Welcome to CoopBank Assistant
    </h1>
    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
      Your 24/7 banking support companion. Get instant answers to your banking questions 
      in English, Amharic, or Oromo.
    </p>
    <div className="flex gap-4 justify-center flex-wrap">
      <Button size="lg" asChild>
        <Link to="/auth">Get Started</Link>
      </Button>
      <Button size="lg" variant="outline">Learn More</Button>
    </div>
  </div>
</section>
```

#### Features Grid
```tsx
<section className="py-16">
  <div className="container mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Assistant?</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {/* Feature 1: Multilingual */}
      <Card className="p-6 text-center">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
        <p className="text-muted-foreground">
          Chat in English, Amharic, or Oromo - we speak your language
        </p>
      </Card>
      
      {/* Feature 2: Instant Answers */}
      <Card className="p-6 text-center">
        <MessageSquare className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Instant Answers</h3>
        <p className="text-muted-foreground">
          Get immediate responses to your banking questions, 24/7
        </p>
      </Card>
      
      {/* Feature 3: Secure */}
      <Card className="p-6 text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
        <p className="text-muted-foreground">
          Bank-grade security with accurate, up-to-date information
        </p>
      </Card>
    </div>
  </div>
</section>
```

### 2. Authentication Page (`/auth`)

#### Auth Layout
```tsx
<div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
  <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
    {/* Header */}
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
      <Button variant="ghost" asChild>
        <Link to="/">← Back to Home</Link>
      </Button>
      <LanguageSwitcher />
    </div>
    
    {/* Auth Card */}
    <Card className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="CoopBank" className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">CoopBank of Oromia</h1>
        <p className="text-muted-foreground">Access your assistant</p>
      </div>
      
      {/* Auth Forms */}
      <Tabs value={currentView} onValueChange={setCurrentView}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        {/* Sign In Form */}
        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Button 
              type="button" 
              variant="link" 
              onClick={() => setCurrentView('forgot')}
              className="w-full"
            >
              Forgot Password?
            </Button>
          </form>
        </TabsContent>
        
        {/* Sign Up Form */}
        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" required />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" required />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  </div>
</div>
```

#### Password Reset Form
```tsx
<Card className="w-full max-w-md p-6">
  <div className="text-center mb-6">
    <h2 className="text-2xl font-bold">Reset Password</h2>
    <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
  </div>
  
  <form onSubmit={handleForgotPassword} className="space-y-4">
    <div>
      <Label htmlFor="reset-email">Email</Label>
      <Input id="reset-email" type="email" required />
    </div>
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Sending..." : "Send Reset Email"}
    </Button>
    <Button 
      type="button" 
      variant="outline" 
      onClick={() => setCurrentView('signin')}
      className="w-full"
    >
      Back to Sign In
    </Button>
  </form>
</Card>
```

### 3. Chat Interface (`/chat`)

#### Chat Layout
```tsx
<div className="flex h-screen bg-background">
  {/* Sidebar */}
  <aside className="w-80 border-r bg-muted/30">
    <ChatThreadsSidebar />
  </aside>
  
  {/* Main Chat Area */}
  <main className="flex-1 flex flex-col">
    <ChatHeader />
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
    <ChatInput />
  </main>
</div>
```

#### Chat Header
```tsx
<header className="border-b p-4 bg-background/95 backdrop-blur">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/bot-avatar.png" />
        <AvatarFallback className="bg-primary text-primary-foreground">CB</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="font-semibold">CoopBank Assistant</h1>
        <p className="text-sm text-muted-foreground">Always here to help</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <VoiceInterface />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
```

#### Chat Messages
```tsx
{/* User Message */}
<div className="flex justify-end">
  <div className="max-w-[80%] rounded-lg bg-primary text-primary-foreground p-3">
    <p>{message.content}</p>
    <span className="text-xs opacity-70">
      {format(new Date(message.created_at), 'HH:mm')}
    </span>
  </div>
</div>

{/* Assistant Message */}
<div className="flex justify-start">
  <div className="flex gap-3 max-w-[80%]">
    <Avatar className="h-8 w-8 flex-shrink-0">
      <AvatarFallback className="bg-accent text-accent-foreground text-xs">CB</AvatarFallback>
    </Avatar>
    <div className="rounded-lg bg-muted p-3">
      <StreamingText content={message.content} />
      <span className="text-xs text-muted-foreground">
        {format(new Date(message.created_at), 'HH:mm')}
      </span>
    </div>
  </div>
</div>
```

#### Chat Input
```tsx
<div className="border-t p-4 bg-background">
  <form onSubmit={handleSubmit} className="flex gap-2">
    <div className="flex-1 relative">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything about banking..."
        className="min-h-[50px] max-h-[200px] resize-none pr-12"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <div className="absolute right-2 bottom-2 flex gap-1">
        <VoiceInterface />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isLoading}
          className="h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </form>
</div>
```

#### Empty State
```tsx
<div className="text-center py-12">
  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
  <h3 className="text-lg font-semibold mb-2">Welcome to CoopBank Assistant</h3>
  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
    I'm here to help with all your banking questions. Ask me about accounts, 
    loans, services, or anything else banking-related.
  </p>
  
  {/* Suggested Questions */}
  <div className="space-y-2">
    <p className="text-sm font-medium">Try asking:</p>
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          variant="outline"
          size="sm"
          onClick={() => handleSuggestionClick(suggestion.question)}
          className="text-left"
        >
          {suggestion.question}
        </Button>
      ))}
    </div>
  </div>
</div>
```

#### Sidebar Chat Threads
```tsx
<div className="p-4">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold">Chat History</h2>
    <Button size="icon" variant="ghost" onClick={createNewThread}>
      <Plus className="h-4 w-4" />
    </Button>
  </div>
  
  <ScrollArea className="h-[calc(100vh-120px)]">
    <div className="space-y-2">
      {threads.map((thread) => (
        <Button
          key={thread.id}
          variant={currentThreadId === thread.id ? "secondary" : "ghost"}
          className="w-full justify-start text-left h-auto p-3"
          onClick={() => selectThread(thread.id)}
        >
          <div className="truncate">
            <div className="font-medium truncate">{thread.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              {thread.last_message_preview}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(thread.updated_at), 'MMM d, HH:mm')}
            </div>
          </div>
        </Button>
      ))}
    </div>
  </ScrollArea>
</div>
```

## Component Features

### Language Switcher
```tsx
<Select value={language} onValueChange={changeLanguage}>
  <SelectTrigger className="w-24">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="en">EN</SelectItem>
    <SelectItem value="am">አማ</SelectItem>
    <SelectItem value="or">OR</SelectItem>
  </SelectContent>
</Select>
```

### Voice Interface
```tsx
<Button 
  variant="ghost" 
  size="icon"
  onClick={isRecording ? stopRecording : startRecording}
  className={isRecording ? "text-red-500" : ""}
>
  <Mic className="h-4 w-4" />
</Button>
```

## Responsive Design

### Mobile Layout
- Collapsible sidebar on mobile
- Full-width chat interface
- Touch-optimized buttons
- Responsive typography scaling

### Tablet Layout
- Side-by-side layout maintained
- Optimized touch targets
- Adjusted spacing and padding

### Desktop Layout
- Full sidebar visible
- Optimal reading widths
- Hover states and interactions

## Animation & Interactions

### Smooth Transitions
```css
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Loading States
- Skeleton loaders for chat messages
- Spinning indicators for API calls
- Streaming text animation for responses

### Micro-interactions
- Button hover effects
- Focus states for accessibility
- Smooth page transitions

This interface documentation provides everything needed to replicate the CoopBank of Oromia chatbot's clean, professional, and user-friendly design system.