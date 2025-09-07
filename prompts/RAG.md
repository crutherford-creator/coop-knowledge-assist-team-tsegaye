# RAG System

## Edge Function: chat-with-rag
Create Supabase edge function that:
- Takes user message, thread ID, user ID
- Queries Flowise RAG system first
- Falls back to OpenAI if needed
- Saves messages to database
- Returns response

## Flowise Setup
- Connect to bank documents in Supabase storage
- Use OpenAI embeddings and GPT-4o-mini
- Return relevant document chunks
- Support multiple languages

## Knowledge Base
- Store bank documents in 'bankdocs' bucket
- Support PDF, DOCX, TXT files
- Include policies, procedures, FAQs
- Maintain in English, Amharic, Oromo

Keep it simple - RAG for accurate answers, OpenAI for general help.