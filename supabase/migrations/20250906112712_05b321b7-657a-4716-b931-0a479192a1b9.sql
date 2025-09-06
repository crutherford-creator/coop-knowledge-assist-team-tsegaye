-- =====================================================
-- Customer Support RAG Chat Schema - Supabase Version
-- =====================================================

-- Create ENUM type for message sender
CREATE TYPE public.message_sender AS ENUM ('user', 'agent');

-- ==========================
-- 1. Chat Threads Table
-- ==========================
CREATE TABLE public.chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
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

-- Index for faster retrieval of user threads
CREATE INDEX idx_chat_threads_user ON public.chat_threads(user_id);
CREATE INDEX idx_chat_threads_updated ON public.chat_threads(updated_at DESC);

-- ==========================
-- 2. Messages Table
-- ==========================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender public.message_sender NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB, -- For storing source citations, confidence scores, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages (users can only access messages from their own threads)
CREATE POLICY "Users can view messages from their own threads" 
ON public.messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chat_threads 
        WHERE id = messages.thread_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in their own threads" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_threads 
        WHERE id = messages.thread_id 
        AND user_id = auth.uid()
    )
);

-- Index for fast retrieval of messages per thread
CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- ==========================
-- 3. Timestamp Update Functions and Triggers
-- ==========================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_threads
CREATE TRIGGER update_chat_threads_updated_at
    BEFORE UPDATE ON public.chat_threads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================
-- 4. Helper Functions
-- ==========================

-- Function to get recent chat threads for a user
CREATE OR REPLACE FUNCTION public.get_user_chat_threads(user_uuid UUID, thread_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    message_count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;