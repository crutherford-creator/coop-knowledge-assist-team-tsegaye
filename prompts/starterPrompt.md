# CoopBank of Oromia Customer Support Chatbot - Complete Project Prompt

## Project Overview

Build a complete customer support chatbot application for CoopBank of Oromia using React, TypeScript, Tailwind CSS, and Supabase. The system should provide multilingual banking support through RAG (Retrieval-Augmented Generation) technology.

## Quick Start Requirements

**Technology Stack:**
- Frontend: React 18+ with TypeScript, Vite, Tailwind CSS
- Backend: Supabase (Database, Auth, Storage, Edge Functions)
- AI: OpenAI API, Flowise for RAG
- Internationalization: react-i18next (English, Amharic, Oromo)

**Brand Identity:**
- Company: CoopBank of Oromia (Ethiopian cooperative bank)
- Colors: Primary #00adef (blue), Secondary #000000 (black), Accent #e38524 (orange)
- Purpose: 24/7 multilingual customer support for banking services

## Core Functionality Required

### 1. Authentication System
- Email/password signup and signin using Supabase Auth
- Password reset with email redirects
- Protected routes that redirect to landing page if not authenticated
- Persistent sessions with automatic token refresh

### 2. Landing Page
- Hero section with brand colors and clear value proposition
- Features grid highlighting multilingual support, instant answers, security
- Authentication status-based navigation (Sign In OR Go to Chat + Sign Out)
- Language switcher in header

### 3. Chat Interface
- Left sidebar for chat thread management
- Main chat area with header, messages, and input
- Real-time conversation with streaming assistant responses
- Voice input/output capabilities
- Empty state with suggested questions from database

### 4. RAG Knowledge System
- Supabase Edge Function for chat processing
- Integration with Flowise for document retrieval
- Fallback to direct OpenAI if RAG fails
- Banking document storage and processing

## Database Schema Required

```sql
-- Chat threads table
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages table with enum
CREATE TYPE message_sender AS ENUM ('user', 'assistant');
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender message_sender NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suggestions table
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Security:** Enable RLS on all tables with user-scoped policies using auth.uid()

## Edge Functions Required

### chat-with-rag Function
- Parameters: message, threadId, userId, language
- Query Flowise RAG system with conversation history
- Fallback to OpenAI direct with banking context
- Save user message and assistant response to database
- Return response with source documents

### speech-to-text Function
- Convert audio input to text using OpenAI Whisper
- Support multilingual transcription

### text-to-speech Function
- Convert text responses to audio using OpenAI TTS
- Support multiple languages and voices

## UI/UX Requirements

**Design System:**
- Use exact brand colors in HSL format in index.css
- Clean, professional banking interface
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions

**Layout Structure:**
- `/` - Landing page with hero, features, auth
- `/auth` - Authentication with tabs for signin/signup
- `/chat` - Main interface with sidebar and chat area

**Components Needed:**
- ChatHeader with bot info and controls
- ChatThreadsSidebar for conversation history
- ChatMessage with user/assistant styling
- ChatInput with voice controls and send button
- EmptyState with suggested questions
- LanguageSwitcher for EN/አማ/OR selection
- StreamingText for typing animation
- VoiceInterface for speech controls

## Internationalization

**Languages Required:**
- English (en) - Primary business language
- Amharic (am) - Ethiopian national language
- Oromo (or) - Regional language of Oromia

**Implementation:**
- react-i18next with JSON translation files
- Language detection and localStorage persistence
- UI text translation and RAG response language matching
- Language switcher component in all page headers

## RAG Integration

**Flowise Setup:**
- Document loader connected to Supabase 'bankdocs' storage bucket
- Text splitting with 1000 chunk size, 200 overlap
- OpenAI embeddings (text-embedding-3-small)
- Vector store with similarity search
- GPT-4o-mini for response generation

**Knowledge Base:**
- Banking policies, procedures, product information
- FAQ documents, regulatory information
- Support for PDF, DOCX, TXT, MD formats
- Multilingual document support

## Sample Data

**Initial Suggestions:**
- "What are the current interest rates for savings accounts?"
- "How can I apply for a loan?"
- "What documents do I need to open an account?"
- "How do I reset my online banking password?"
- "What are the bank's operating hours?"
- "How can I contact customer support?"

## Security & Compliance

**Database Security:**
- Row Level Security on all tables
- User can only access their own data
- Secure functions with proper access control

**Application Security:**
- Input validation and sanitization
- XSS prevention
- Secure authentication flow
- No sensitive data exposure

## Performance Requirements

**Response Times:**
- RAG queries: < 3 seconds
- Page loads: < 2 seconds
- Authentication: < 1 second

**User Experience:**
- Smooth typing animations
- Loading states for all operations
- Error handling with user-friendly messages
- Offline capability where possible

## Success Criteria

**Functional Requirements:**
- Users can create accounts and sign in securely
- Multilingual interface switches correctly
- Chat conversations are saved and retrievable
- RAG system provides relevant banking information
- Voice input/output works in all supported languages

**Quality Requirements:**
- Professional, trustworthy appearance
- Responsive design across all devices
- Fast, reliable performance
- Accessible to users with disabilities
- Banking industry compliance standards

## Implementation Priority

1. **Phase 1**: Basic auth, database setup, landing page
2. **Phase 2**: Chat interface, message storage, basic responses
3. **Phase 3**: RAG integration, knowledge base setup
4. **Phase 4**: Voice capabilities, advanced features
5. **Phase 5**: Performance optimization, testing

Start with Phase 1 and build incrementally, ensuring each phase is fully functional before proceeding to the next.