# System Architecture

Simple 3-part system for CoopBank chatbot:

## Frontend (Lovable)
- React/TypeScript interface
- Supabase integration
- Multilingual support (EN/AM/OR)

## Backend (Supabase)
- User authentication
- Chat storage (threads/messages)
- Edge functions for AI

## AI (RAG + OpenAI)
- Flowise for document search
- OpenAI as fallback
- Bank knowledge base

Keep it simple - Lovable handles the frontend, Supabase handles data and auth, RAG provides smart responses.