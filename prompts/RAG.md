# RAG System Requirements

## Edge Function: chat-with-rag

**Create Supabase Edge Function with these capabilities:**

**Input Parameters:**
- message (string, required) - User's question
- threadId (UUID, required) - Current conversation thread
- userId (UUID, required) - Authenticated user ID
- language (string, optional) - User's preferred language (en/am/or)

**Core Functionality:**
- Query Flowise RAG system with user message and conversation history
- Fallback to direct OpenAI if Flowise fails
- Save both user message and assistant response to database
- Update thread timestamp after each interaction
- Return assistant response with source documents

**Conversation History:**
- Retrieve last 10 messages from thread for context
- Format for RAG system: {role: 'human'|'ai', content: string}
- Include history in RAG query for contextual responses
- Limit history to prevent token overflow

**Error Handling:**
- Try Flowise RAG first, fallback to OpenAI direct
- Log errors without exposing sensitive information
- Return graceful error messages to users
- Handle network timeouts and API failures

## Flowise Integration

**RAG Configuration Requirements:**
- Document Loader: Connect to Supabase storage 'bankdocs' bucket
- Text Splitter: RecursiveCharacterTextSplitter with 1000 chunk size, 200 overlap
- Embeddings: OpenAI text-embedding-3-small (1536 dimensions)
- Vector Store: Chroma or similar with similarity search
- Retriever: Return top 5 relevant chunks with 0.7 score threshold
- LLM: GPT-4o-mini with temperature 0.1 for consistent responses

**API Integration:**
- Flowise chatflow endpoint for RAG queries
- Include conversation history in requests
- Return source documents with responses
- Support language-specific processing

## OpenAI Fallback

**Direct OpenAI Integration:**
- Use GPT-4o-mini model for consistency
- System prompt: CoopBank assistant with language preference
- Include conversation context (last 5 messages)
- Temperature 0.1 for reliable banking information
- Max tokens 1000 to control response length

**System Prompt Template:**
```
You are a helpful assistant for CoopBank of Oromia. 
Respond in [LANGUAGE]. 
Provide helpful information about banking services, but acknowledge when you need specific bank information.
Be professional, friendly, and accurate.
```

## Knowledge Base Requirements

**Document Structure:**
- Banking policies and procedures
- Product information (loans, accounts, services)
- FAQ documents with common questions
- Regulatory and compliance information
- Branch locations and contact information

**Document Format:**
- Support PDF, DOCX, TXT, MD formats
- Structured with clear headings and sections
- Include metadata: category, language, last updated
- Maintain source attribution for responses

**Multilingual Support:**
- Documents in English, Amharic, and Oromo
- Language-specific embeddings if needed
- Cross-language query capability
- Consistent information across languages

## Document Processing

**Text Splitting Strategy:**
- Respect document structure (paragraphs, sections)
- Preserve context across chunks
- Handle tables and lists appropriately
- Maintain metadata with each chunk

**Embedding Generation:**
- Use OpenAI text-embedding-3-small consistently
- Process documents in batches for efficiency
- Store embeddings with document metadata
- Update embeddings when documents change

## Retrieval Logic

**Search Configuration:**
- Similarity search with score threshold 0.7
- Return top 5 most relevant chunks
- Include document source information
- Filter by language preference when possible

**Response Generation:**
- Combine retrieved context with user question
- Generate response using RAG-augmented prompt
- Include source document references
- Maintain conversation context

## Storage Requirements

**Supabase Storage Bucket:**
- Name: 'bankdocs'
- Public access for document retrieval
- Organized folder structure by category/language
- Version control for document updates

**Document Management:**
- Upload interface for authorized users
- Document validation and processing
- Automatic reindexing on updates
- Backup and recovery procedures

## Performance Optimization

**Caching Strategy:**
- Cache frequent queries and responses
- Store embeddings efficiently
- Implement response deduplication
- TTL for cached content (1 hour)

**Response Time Targets:**
- RAG query response: < 3 seconds
- Fallback OpenAI response: < 5 seconds
- Document retrieval: < 1 second
- Total user wait time: < 10 seconds

## Quality Assurance

**Response Validation:**
- Verify factual accuracy against source documents
- Check language consistency with user preference
- Ensure appropriate tone and professionalism
- Validate banking terminology usage

**Source Attribution:**
- Include document references with responses
- Show confidence scores when available
- Link to original documents when helpful
- Maintain audit trail of information sources

## Security Considerations

**Data Privacy:**
- No customer PII in knowledge base
- Sanitized examples and scenarios
- Secure document access controls
- Audit logs for document access

**API Security:**
- Authenticate all RAG requests
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure error handling without information leakage

## Monitoring Requirements

**Track Key Metrics:**
- Query response times
- RAG vs fallback usage ratio
- User satisfaction indicators
- Source document utilization
- Language-specific performance

**Error Monitoring:**
- Failed RAG queries
- OpenAI API errors
- Document processing failures
- User session timeouts