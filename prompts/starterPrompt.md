# CoopBank of Oromia Customer Support Chatbot

Build a customer support chatbot application for CoopBank of Oromia using React, TypeScript, Tailwind CSS, and Supabase with RAG-powered responses.

## Tech Stack
- Frontend: React 18+ with TypeScript, Vite, Tailwind CSS
- Backend: Supabase (Database, Auth, Storage, Edge Functions)
- AI: OpenAI API, Flowise for RAG
- Internationalization: react-i18next (English, Amharic, Oromo)

## Brand Identity
- Company: CoopBank of Oromia (Ethiopian cooperative bank)
- Colors: Primary #00adef (blue), Secondary #000000 (black), Accent #e38524 (orange)
- Purpose: 24/7 multilingual customer support for banking services

## Core Features
1. **Authentication**: Email/password with Supabase Auth
2. **Landing Page**: Hero section with brand colors and value proposition
3. **Chat Interface**: Sidebar for threads, main chat area, voice capabilities
4. **RAG System**: Banking knowledge retrieval via Flowise + OpenAI fallback
5. **Multilingual**: Support for English, Amharic, and Oromo

## Key Components Needed
- ChatHeader, ChatThreadsSidebar, ChatMessage, ChatInput
- EmptyState with database suggestions, LanguageSwitcher
- StreamingText, VoiceInterface, RequireAuth

## Implementation Priority
1. Auth system and database setup
2. Chat interface with message storage
3. RAG integration with Flowise
4. Voice capabilities and optimization