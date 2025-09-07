# Database Model Requirements

## Create Supabase Database Schema

### Core Tables Needed

**Create a chat_threads table:**
- id (UUID, primary key, auto-generated)
- user_id (UUID, references auth.users, required)
- title (varchar, default 'New Chat')
- created_at (timestamp, auto-generated)
- updated_at (timestamp, auto-generated with trigger)

**Create a messages table:**
- id (UUID, primary key, auto-generated)
- thread_id (UUID, references chat_threads)
- content (text, required)
- sender (enum: 'user' | 'assistant')
- metadata (jsonb for storing source documents, language info)
- created_at (timestamp, auto-generated)

**Create a suggestions table:**
- id (UUID, primary key, auto-generated)
- question (text, required)
- category (text, optional)
- is_active (boolean, default true)
- display_order (integer, default 0)
- created_at (timestamp, auto-generated)

### Security Requirements

**Enable Row Level Security (RLS) on all tables:**
- Users can only access their own chat threads and messages
- Suggestions are publicly readable
- All policies should use auth.uid() for user identification

**Create these specific RLS policies:**
- "Users can view their own chat threads" - SELECT using auth.uid() = user_id
- "Users can create their own chat threads" - INSERT with check auth.uid() = user_id
- "Users can update their own chat threads" - UPDATE using auth.uid() = user_id
- "Users can delete their own chat threads" - DELETE using auth.uid() = user_id
- "Users can view messages from their own threads" - SELECT with EXISTS subquery to chat_threads
- "Users can create messages in their own threads" - INSERT with EXISTS subquery check
- "Anyone can view active suggestions" - SELECT using is_active = true

### Database Functions Required

**Create update_updated_at_column trigger function:**
- Automatically updates updated_at timestamp on chat_threads table updates

**Create get_user_chat_threads function:**
- Parameters: user_uuid, thread_limit (default 10)
- Returns: id, title, created_at, updated_at, last_message_preview, message_count
- Security: DEFINER with search_path = public
- Should join with messages to get preview and count

### Storage Requirements

**Create storage bucket:**
- Bucket name: 'bankdocs'
- Public: true
- For storing RAG knowledge base documents

### Initial Data

**Insert sample suggestions:**
- "What are the current interest rates for savings accounts?"
- "How can I apply for a loan?"
- "What documents do I need to open an account?"
- "How do I reset my online banking password?"
- "What are the bank's operating hours?"
- "How can I contact customer support?"

### Required Secrets

Add these secrets to Supabase Edge Functions:
- OPENAI_API_KEY
- SUPABASE_URL  
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL