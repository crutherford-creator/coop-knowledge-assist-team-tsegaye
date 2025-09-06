-- Create suggestions table for storing sample questions
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read suggestions (public data)
CREATE POLICY "Anyone can view active suggestions" 
ON public.suggestions 
FOR SELECT 
USING (is_active = true);

-- Insert some sample suggestions
INSERT INTO public.suggestions (question, category, display_order) VALUES
('What are the loan application requirements?', 'Loans', 1),
('How do I open a new savings account?', 'Accounts', 2),
('What are the current interest rates?', 'Rates', 3),
('How can I transfer money between accounts?', 'Transfers', 4),
('What documents do I need for account verification?', 'Documentation', 5),
('How do I apply for a business loan?', 'Business', 6);