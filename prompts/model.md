# Database Schema

## Tables

**chat_threads**
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- title (text, default 'New Chat')
- created_at, updated_at (timestamps)

**messages**
- id (UUID, primary key)
- thread_id (UUID, references chat_threads)
- content (text)
- sender ('user' | 'assistant')
- metadata (jsonb)
- created_at (timestamp)

**suggestions**
- id (UUID, primary key)
- question (text)
- is_active (boolean)
- display_order (integer)

## Security
Enable RLS on all tables:
- Users only see their own threads/messages
- Suggestions are public

## Storage
Create 'bankdocs' bucket for RAG documents.

Simple schema focused on chat functionality.