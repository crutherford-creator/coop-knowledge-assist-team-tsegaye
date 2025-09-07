# Systems Architecture Requirements

## Overall Technology Stack

**Frontend Framework:**
- React 18+ with TypeScript
- Vite for build tooling and development
- Tailwind CSS for styling with custom design tokens
- React Router DOM for navigation

**Backend Infrastructure:**
- Supabase for backend services
- PostgreSQL database with Row Level Security
- Supabase Auth for user authentication
- Supabase Storage for document management
- Supabase Edge Functions for serverless API

**External Integrations:**
- OpenAI API for LLM responses
- Flowise for RAG knowledge management
- i18next for internationalization

## Application Architecture

**Component Structure:**
```
src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── ChatHeader.tsx
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   ├── ChatThreadsSidebar.tsx
│   ├── EmptyState.tsx
│   ├── LanguageSwitcher.tsx
│   ├── StreamingText.tsx
│   ├── VoiceInterface.tsx
│   └── RequireAuth.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Chat.tsx
│   └── NotFound.tsx
├── i18n/
│   ├── index.ts
│   └── locales/ (en.json, am.json, or.json)
├── integrations/supabase/
│   ├── client.ts
│   └── types.ts (auto-generated)
└── hooks/ (custom React hooks)
```

## Database Architecture

**Core Tables:**
- chat_threads: User conversation containers
- messages: Individual chat messages
- suggestions: Pre-defined question suggestions

**Security Model:**
- Row Level Security (RLS) on all tables
- User-scoped data access policies
- Secure functions with SECURITY DEFINER

**Data Relationships:**
- Users (1) → Chat Threads (Many)
- Chat Threads (1) → Messages (Many)
- Messages include metadata for source documents

## API Architecture

**Edge Functions Required:**
1. **chat-with-rag**: Main conversation handler
   - Input: message, threadId, userId, language
   - Output: assistant response, source documents
   - Integrates with Flowise and OpenAI

2. **speech-to-text**: Voice input processing
   - Input: audio file
   - Output: transcribed text
   - Uses OpenAI Whisper API

3. **text-to-speech**: Voice output generation
   - Input: text, voice preferences
   - Output: audio file
   - Uses OpenAI TTS API

**Authentication:**
- Supabase Auth with JWT tokens
- User session management
- Protected routes and API endpoints

## RAG System Architecture

**Knowledge Management:**
- Flowise for document processing and RAG orchestration
- Vector database for semantic search
- Document versioning and updates

**Document Pipeline:**
1. Upload → Supabase Storage
2. Process → Text extraction and chunking
3. Embed → Vector generation
4. Index → Vector database storage
5. Query → Semantic retrieval

**Fallback Strategy:**
- Primary: Flowise RAG system
- Secondary: Direct OpenAI with context
- Graceful degradation for service failures

## Frontend State Management

**Authentication State:**
- AuthContext for user session
- Persistent login with localStorage
- Route protection logic

**Chat State:**
- Local state for current conversation
- Thread management and switching
- Message loading and pagination

**Global State:**
- Language preferences
- Theme settings
- Error handling

## Internationalization Architecture

**i18next Configuration:**
- Browser language detection
- localStorage persistence
- Fallback to English
- Translation namespaces

**Language Support:**
- English (en): Primary language
- Amharic (am): Ethiopian national language
- Oromo (or): Regional language

**Implementation:**
- React components use useTranslation hook
- JSON translation files for each language
- Language switcher updates entire UI
- RAG responses in user's selected language

## Security Architecture

**Frontend Security:**
- Input validation and sanitization
- XSS prevention
- Secure storage of auth tokens
- Environment variable protection

**Backend Security:**
- Row Level Security policies
- Authenticated API endpoints
- Rate limiting on edge functions
- Secure secrets management

**Data Security:**
- Encrypted data transmission
- No PII in knowledge base
- Audit logging for sensitive operations
- Compliance with banking regulations

## Performance Architecture

**Frontend Optimization:**
- Code splitting with React.lazy
- Component memoization
- Efficient re-rendering strategies
- Image optimization and lazy loading

**Backend Optimization:**
- Database indexing strategy
- Query optimization
- Response caching
- Connection pooling

**API Performance:**
- Edge function cold start optimization
- Response streaming where applicable
- Timeout handling
- Error retry mechanisms

## Deployment Architecture

**Hosting:**
- Frontend: Lovable deployment platform
- Backend: Supabase managed infrastructure
- Edge Functions: Supabase Edge Runtime
- Storage: Supabase Storage

**Environment Management:**
- Development: Local with Supabase remote
- Staging: Lovable preview deployment
- Production: Lovable published deployment

**CI/CD:**
- Automatic deployment on code changes
- Environment variable management
- Database migration handling

## Monitoring and Observability

**Application Monitoring:**
- Error tracking and reporting
- Performance metrics
- User interaction analytics
- API usage statistics

**Infrastructure Monitoring:**
- Database performance
- Edge function execution metrics
- Storage usage tracking
- Authentication success rates

## Scalability Considerations

**Database Scaling:**
- Connection pooling
- Read replicas if needed
- Partitioning for large message tables
- Archive strategy for old conversations

**API Scaling:**
- Edge function auto-scaling
- Rate limiting and throttling
- Caching strategies
- Load balancing

**Frontend Scaling:**
- CDN for static assets
- Progressive loading
- Offline capability
- Mobile optimization

## Integration Points

**External Services:**
- OpenAI API for LLM capabilities
- Flowise for RAG management
- Email service for authentication
- Analytics service for usage tracking

**Internal Services:**
- Supabase Auth for user management
- Supabase Database for data storage
- Supabase Storage for file management
- Supabase Edge Functions for business logic