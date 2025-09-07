# RAG (Retrieval-Augmented Generation) Implementation Documentation

## Overview

This document outlines the RAG implementation for the CoopBank of Oromia customer support chatbot, which leverages Flowise for knowledge base management and OpenAI for intelligent responses.

## RAG Architecture

### System Components

1. **Knowledge Base**: Flowise-managed document store
2. **Vector Database**: Embedded within Flowise
3. **LLM Integration**: OpenAI GPT models
4. **Edge Functions**: Supabase-hosted API endpoints
5. **Document Storage**: Supabase Storage for source documents

## Flowise Integration

### Setup Requirements

#### Flowise Configuration
```json
{
  "chatflow": {
    "name": "CoopBank Support RAG",
    "description": "Banking knowledge retrieval system",
    "nodes": {
      "documentLoader": {
        "type": "DocumentLoader",
        "config": {
          "source": "supabase_storage",
          "bucket": "bankdocs",
          "formats": ["pdf", "docx", "txt", "md"]
        }
      },
      "textSplitter": {
        "type": "RecursiveCharacterTextSplitter",
        "config": {
          "chunkSize": 1000,
          "chunkOverlap": 200,
          "separators": ["\n\n", "\n", " ", ""]
        }
      },
      "embeddings": {
        "type": "OpenAIEmbeddings",
        "config": {
          "model": "text-embedding-3-small",
          "dimensions": 1536
        }
      },
      "vectorStore": {
        "type": "Chroma",
        "config": {
          "collectionName": "coopbank_knowledge",
          "persistDirectory": "./chroma_db"
        }
      },
      "retriever": {
        "type": "VectorStoreRetriever",
        "config": {
          "searchType": "similarity",
          "searchKwargs": {
            "k": 5,
            "scoreThreshold": 0.7
          }
        }
      },
      "llm": {
        "type": "ChatOpenAI",
        "config": {
          "model": "gpt-4o-mini",
          "temperature": 0.1,
          "maxTokens": 1000
        }
      }
    }
  }
}
```

#### Flowise API Integration
```typescript
// Edge function integration with Flowise
const FLOWISE_API_URL = "https://your-flowise-instance.com/api/v1/prediction";
const FLOWISE_CHATFLOW_ID = "your-chatflow-id";

const response = await fetch(`${FLOWISE_API_URL}/${FLOWISE_CHATFLOW_ID}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FLOWISE_API_KEY}`
  },
  body: JSON.stringify({
    question: userMessage,
    history: conversationHistory,
    overrideConfig: {
      returnSourceDocuments: true
    }
  })
});
```

## Edge Function: chat-with-rag

### Complete Implementation

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const FLOWISE_API_URL = Deno.env.get('FLOWISE_API_URL')!;
const FLOWISE_CHATFLOW_ID = Deno.env.get('FLOWISE_CHATFLOW_ID')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request
    const { message, threadId, userId, language = 'en' } = await req.json();

    if (!message || !threadId || !userId) {
      throw new Error('Missing required parameters: message, threadId, userId');
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('content, sender, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (messagesError) throw messagesError;

    // Format conversation history for RAG
    const conversationHistory = messages?.map(msg => ({
      role: msg.sender === 'user' ? 'human' : 'ai',
      content: msg.content
    })) || [];

    // Save user message
    const { error: saveUserError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content: message,
        sender: 'user'
      });

    if (saveUserError) throw saveUserError;

    // Query Flowise RAG system
    const ragResponse = await fetch(`${FLOWISE_API_URL}/prediction/${FLOWISE_CHATFLOW_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('FLOWISE_API_KEY')}`
      },
      body: JSON.stringify({
        question: message,
        history: conversationHistory,
        overrideConfig: {
          returnSourceDocuments: true,
          language: language
        }
      })
    });

    let assistantResponse: string;
    let sourceDocuments: any[] = [];

    if (ragResponse.ok) {
      const ragData = await ragResponse.json();
      assistantResponse = ragData.text || ragData.answer;
      sourceDocuments = ragData.sourceDocuments || [];
    } else {
      console.error('Flowise RAG failed, falling back to OpenAI direct');
      
      // Fallback to direct OpenAI call
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant for CoopBank of Oromia. 
                       Respond in ${language === 'am' ? 'Amharic' : language === 'or' ? 'Oromo' : 'English'}.
                       Provide helpful information about banking services, but acknowledge when you need specific bank information.`
            },
            ...conversationHistory.slice(-5).map(msg => ({
              role: msg.role === 'human' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.1,
          max_tokens: 1000
        }),
      });

      const openaiData = await openaiResponse.json();
      assistantResponse = openaiData.choices[0].message.content;
    }

    // Save assistant response
    const { error: saveAssistantError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content: assistantResponse,
        sender: 'assistant',
        metadata: {
          sourceDocuments: sourceDocuments,
          language: language,
          timestamp: new Date().toISOString()
        }
      });

    if (saveAssistantError) throw saveAssistantError;

    // Update thread timestamp
    const { error: updateThreadError } = await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (updateThreadError) throw updateThreadError;

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        sourceDocuments: sourceDocuments,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-rag function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Knowledge Base Structure

### Document Categories

1. **Banking Policies**
   - Account opening procedures
   - Interest rate policies
   - Fee structures
   - Terms and conditions

2. **Product Information**
   - Savings account details
   - Loan products
   - Credit cards
   - Digital banking services

3. **Procedures & Processes**
   - Customer onboarding
   - Complaint resolution
   - Transaction procedures
   - Security protocols

4. **Regulatory Information**
   - Compliance requirements
   - Legal disclosures
   - Privacy policies
   - Anti-money laundering

### Document Format Requirements

#### Recommended Document Structure
```markdown
# Document Title
**Category**: [Product/Policy/Procedure/Regulatory]
**Language**: [en/am/or]
**Last Updated**: [Date]

## Summary
Brief overview of the document content

## Key Information
- Bullet point 1
- Bullet point 2
- Bullet point 3

## Detailed Content
[Detailed information with clear headings and sections]

## Related Documents
- Link to related document 1
- Link to related document 2

## Contact Information
For questions about this topic, contact: [Department/Email]
```

#### Metadata Standards
```json
{
  "title": "Document Title",
  "category": "product|policy|procedure|regulatory",
  "language": "en|am|or",
  "lastUpdated": "YYYY-MM-DD",
  "version": "1.0",
  "audience": "customer|employee|both",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "relatedDocuments": ["doc-id-1", "doc-id-2"]
}
```

## Vector Database Configuration

### Embedding Strategy
```typescript
// Optimal embedding configuration for banking documents
const embeddingConfig = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " "]
};

// Custom text splitter for banking documents
const bankingTextSplitter = {
  preserveStructure: true,
  respectParagraphs: true,
  maintainContext: true,
  handleTables: true,
  preserveMetadata: true
};
```

### Retrieval Configuration
```typescript
const retrievalSettings = {
  searchType: "similarity_score_threshold",
  scoreThreshold: 0.7,
  k: 5,
  fetchK: 20,
  lambda_mult: 0.5, // Diversity parameter
  filter: {
    language: "user_preferred_language",
    category: "user_context_category"
  }
};
```

## Multilingual RAG Implementation

### Language-Specific Processing

#### English Processing
```typescript
const englishConfig = {
  embeddings: "text-embedding-3-small",
  chunkSize: 1000,
  preprocessing: {
    stopWords: true,
    stemming: false,
    lemmatization: true
  }
};
```

#### Amharic Processing
```typescript
const amharicConfig = {
  embeddings: "text-embedding-3-small",
  chunkSize: 800, // Shorter due to script density
  preprocessing: {
    normalization: true,
    characterCleaning: true,
    scriptHandling: "ethiopic"
  }
};
```

#### Oromo Processing
```typescript
const oromoConfig = {
  embeddings: "text-embedding-3-small",
  chunkSize: 900,
  preprocessing: {
    diacriticHandling: true,
    latinScript: true,
    dialectNormalization: true
  }
};
```

## Performance Optimization

### Caching Strategy
```typescript
// Implement response caching for common queries
const cacheConfig = {
  enabled: true,
  ttl: 3600, // 1 hour
  maxSize: 1000,
  keyStrategy: "hash_query_and_context",
  invalidationRules: [
    "document_update",
    "policy_change",
    "manual_trigger"
  ]
};
```

### Search Optimization
```typescript
// Implement semantic search improvements
const searchEnhancements = {
  queryExpansion: true,
  synonymMapping: true,
  contextualReranking: true,
  feedbackLearning: true,
  multilanguageAlignment: true
};
```

## Quality Assurance

### Response Validation
```typescript
const responseValidation = {
  factualAccuracy: true,
  sourceAttribution: true,
  languageConsistency: true,
  policyCompliance: true,
  sensitivityCheck: true
};
```

### Monitoring & Analytics
```typescript
const monitoringMetrics = {
  retrievalAccuracy: "precision@k",
  responseQuality: "user_satisfaction",
  latency: "response_time_p95",
  coverage: "knowledge_gap_detection",
  multilingual: "language_quality_scores"
};
```

## Document Management

### Upload Process
1. **Document Validation**: Format, language, metadata verification
2. **Processing**: Text extraction, cleaning, chunking
3. **Embedding**: Vector generation for all language versions
4. **Storage**: Document storage in Supabase bucket
5. **Indexing**: Vector database integration via Flowise
6. **Testing**: RAG retrieval quality validation

### Update Workflow
1. **Change Detection**: Monitor for document updates
2. **Re-processing**: Update embeddings for changed content
3. **Version Control**: Maintain document version history
4. **Cache Invalidation**: Clear related cached responses
5. **Quality Check**: Validate updated retrieval quality

## Security Considerations

### Data Privacy
- No customer PII in knowledge base
- Sanitized examples and scenarios
- Compliance with banking regulations
- Audit trails for all document access

### Access Control
- Role-based document access
- Secure API endpoints
- Authentication for management functions
- Regular security audits

This RAG implementation provides a robust, multilingual knowledge base system that ensures accurate, contextual responses while maintaining the security and compliance standards required for banking applications.