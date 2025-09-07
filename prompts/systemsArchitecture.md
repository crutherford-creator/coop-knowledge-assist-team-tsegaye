# Systems Architecture Requirements

## Macro Architecture Overview

This CoopBank of Oromia chatbot system consists of three main integrated components:

### 1. Frontend (Lovable Platform)
**React-based Customer Interface:**
- Built using Lovable's React/TypeScript/Tailwind stack
- Responsive chat interface with multilingual support
- Real-time conversation management
- Voice input/output capabilities
- User authentication and session management

### 2. Backend Services (Supabase)
**Complete Backend Infrastructure:**
- **Authentication**: User signup, login, password reset via email
- **Database**: PostgreSQL with Row Level Security for chat history, user data
- **Storage**: Document storage for RAG knowledge base
- **Edge Functions**: Serverless API endpoints for chat processing
- **Real-time**: Live message updates and notifications

### 3. RAG System (Flowise)
**Knowledge Management & AI Processing:**
- Document ingestion and processing pipeline
- Vector database for semantic search
- AI orchestration and prompt management
- Context-aware response generation
- Source attribution and citation

## System Integration Flow

### User Authentication Flow
```
User → Lovable Frontend → Supabase Auth → JWT Token → Protected Routes
```

### Chat Processing Flow
```
User Message → Frontend → Supabase Edge Function → Flowise RAG → OpenAI → Response → Database → Frontend
```

### Document Knowledge Flow
```
Admin Upload → Supabase Storage → Flowise Processing → Vector Database → Available for RAG
```

## Technology Stack Integration

**Frontend (Lovable):**
- React 18+ with TypeScript
- Tailwind CSS with custom CoopBank branding
- Supabase client integration
- i18next for multilingual support

**Backend (Supabase):**
- PostgreSQL database with RLS
- Authentication with email/password
- Edge Functions (Deno runtime)
- Storage buckets for documents
- Real-time subscriptions

**RAG System (Flowise):**
- Visual workflow builder
- Vector database integration
- OpenAI API integration
- Document processing pipeline
- Custom prompt templates

## Data Flow Architecture

**User Data:**
- Authentication: Supabase Auth
- Chat Threads: Supabase Database
- Messages: Supabase Database with metadata
- Preferences: Local storage + Database

**Knowledge Data:**
- Documents: Supabase Storage
- Vectors: Flowise Vector Database
- Processing: Flowise Workflows
- Responses: Generated via OpenAI

## Security Model

**Frontend Security:**
- JWT token validation
- Protected routes via Supabase Auth
- Input sanitization and validation

**Backend Security:**
- Row Level Security policies
- API authentication via Supabase
- Rate limiting on Edge Functions

**RAG Security:**
- Secure API endpoints
- No PII in knowledge base
- Audit logging for sensitive operations

## Deployment & Hosting

**Frontend Deployment:**
- Hosted on Lovable platform
- Automatic deployments on code changes
- CDN for static assets

**Backend Deployment:**
- Supabase managed infrastructure
- Auto-scaling Edge Functions
- Managed database with backups

**RAG Deployment:**
- Flowise cloud/self-hosted
- Vector database managed service
- OpenAI API integration

## Monitoring & Maintenance

**Application Monitoring:**
- Supabase dashboard for database metrics
- Edge Function logs and analytics
- Frontend error tracking via Lovable

**System Health:**
- Database performance monitoring
- API response times and success rates
- User engagement and chat metrics

## Scalability Strategy

**Frontend Scaling:**
- Lovable platform handles traffic scaling
- Code splitting and lazy loading
- Efficient state management

**Backend Scaling:**
- Supabase auto-scaling infrastructure
- Connection pooling for database
- Edge Function cold start optimization

**RAG Scaling:**
- Vector database partitioning
- Response caching strategies
- Load balancing for API calls