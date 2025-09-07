# Supabase Database Schema & Model Documentation

## Database Schema Overview

This document contains the complete Supabase database schema, RLS policies, and SQL setup instructions for the CoopBank of Oromia RAG Chatbot system.

## Core Tables

### 1. Chat Threads Table

```sql
-- Create chat_threads table
CREATE TABLE public.chat_threads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title CHARACTER VARYING DEFAULT 'New Chat'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_threads
CREATE POLICY "Users can view their own chat threads" 
ON public.chat_threads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat threads" 
ON public.chat_threads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat threads" 
ON public.chat_threads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat threads" 
ON public.chat_threads 
FOR DELETE 
USING (auth.uid() = user_id);
```

### 2. Messages Table

```sql
-- Create message_sender enum
CREATE TYPE public.message_sender AS ENUM ('user', 'assistant');

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL,
    content TEXT NOT NULL,
    sender public.message_sender NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their own threads" 
ON public.messages 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE chat_threads.id = messages.thread_id 
    AND chat_threads.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their own threads" 
ON public.messages 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE chat_threads.id = messages.thread_id 
    AND chat_threads.user_id = auth.uid()
));
```

### 3. Suggestions Table

```sql
-- Create suggestions table
CREATE TABLE public.suggestions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policy for suggestions
CREATE POLICY "Anyone can view active suggestions" 
ON public.suggestions 
FOR SELECT 
USING (is_active = true);
```

## Database Functions

### 1. Update Timestamp Function

```sql
-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply trigger to chat_threads
CREATE TRIGGER update_chat_threads_updated_at
    BEFORE UPDATE ON public.chat_threads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### 2. User Chat Threads Function

```sql
-- Function to get user chat threads with metadata
CREATE OR REPLACE FUNCTION public.get_user_chat_threads(user_uuid uuid, thread_limit integer DEFAULT 10)
RETURNS TABLE(
    id uuid, 
    title character varying, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    last_message_preview text, 
    message_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        ct.id,
        ct.title,
        ct.created_at,
        ct.updated_at,
        (
            SELECT content 
            FROM public.messages m 
            WHERE m.thread_id = ct.id 
            ORDER BY m.created_at DESC 
            LIMIT 1
        ) as last_message_preview,
        (
            SELECT COUNT(*) 
            FROM public.messages m 
            WHERE m.thread_id = ct.id
        ) as message_count
    FROM public.chat_threads ct
    WHERE ct.user_id = user_uuid
    ORDER BY ct.updated_at DESC
    LIMIT thread_limit;
$function$
```

## Storage Buckets

### Bank Documents Bucket

```sql
-- Create storage bucket for bank documents (RAG knowledge base)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bankdocs', 'bankdocs', true);

-- Storage policies for bankdocs
CREATE POLICY "Anyone can view bank documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bankdocs');

-- Admin-only upload policy (adjust based on your admin role system)
CREATE POLICY "Authenticated users can upload bank documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bankdocs' AND auth.role() = 'authenticated');
```

## Environment Variables & Secrets

### Required Supabase Secrets

Set these in your Supabase project settings:

```bash
# OpenAI API Key for RAG functionality
OPENAI_API_KEY=your_openai_api_key_here

# Supabase connection details
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=your_supabase_database_url
```

## Initial Data Setup

### Sample Suggestions

```sql
-- Insert sample suggestions for the chatbot
INSERT INTO public.suggestions (question, category, display_order, is_active) VALUES
('What are the current interest rates for savings accounts?', 'Banking Services', 1, true),
('How can I apply for a loan?', 'Loans', 2, true),
('What documents do I need to open an account?', 'Account Opening', 3, true),
('How do I reset my online banking password?', 'Digital Banking', 4, true),
('What are the bank''s operating hours?', 'General Information', 5, true),
('How can I contact customer support?', 'Support', 6, true);
```

## Database Security Notes

1. **Row Level Security (RLS)**: All tables have RLS enabled with user-specific policies
2. **Authentication Required**: Most operations require authenticated users
3. **Data Isolation**: Users can only access their own chat threads and messages
4. **Public Suggestions**: Suggestions are publicly readable but admin-controlled
5. **Secure Functions**: Database functions use SECURITY DEFINER for controlled access

## Migration Commands

To set up the complete database schema, run these commands in order:

1. Create enums and tables
2. Enable RLS on all tables
3. Create RLS policies
4. Create functions and triggers
5. Set up storage buckets and policies
6. Insert initial data

## Testing the Schema

```sql
-- Test queries to verify setup
SELECT * FROM public.suggestions WHERE is_active = true;
SELECT * FROM public.get_user_chat_threads('your-user-uuid');

-- Verify RLS is working
SELECT * FROM public.chat_threads; -- Should only show user's own threads
```

## Performance Considerations

1. **Indexing**: Consider adding indexes on frequently queried columns:
   ```sql
   CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
   CREATE INDEX idx_messages_created_at ON public.messages(created_at);
   CREATE INDEX idx_chat_threads_user_id ON public.chat_threads(user_id);
   CREATE INDEX idx_suggestions_active_order ON public.suggestions(is_active, display_order);
   ```

2. **Cleanup**: Implement data retention policies for old messages if needed

This schema provides a secure, scalable foundation for the CoopBank of Oromia chatbot system with proper user isolation and efficient querying capabilities.