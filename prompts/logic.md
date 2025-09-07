# Business Logic Requirements

## Authentication Flow

**Implement Supabase Authentication:**
- Email/password signup and signin
- Password reset via email with redirect
- Session persistence using localStorage
- Auto-refresh tokens
- Redirect URLs: use dynamic window.location.origin + specific paths

**Auth Context Requirements:**
- Store both user and session objects (not just user)
- Handle onAuthStateChange events properly
- Prevent auth deadlocks by avoiding async functions in auth callback
- Include emailRedirectTo in signup options
- Implement proper error handling for auth operations

**Route Protection:**
- RequireAuth component that wraps protected routes
- Redirect unauthenticated users to landing page
- Show loading spinner during auth state check
- Automatic redirect to /chat after successful login

## Chat Thread Management

**Thread Creation:**
- Auto-create new thread when user starts first conversation
- Generate meaningful thread titles from first message
- Store user_id association for RLS security

**Thread Selection:**
- Load user's thread list from get_user_chat_threads function
- Display threads with preview and timestamp
- Allow switching between threads
- Maintain current thread state in URL or context

**Thread Updates:**
- Update thread updated_at timestamp on new messages
- Limit thread history to reasonable number (10-20 threads)
- Clean up old threads periodically if needed

## Message Handling

**Message Storage:**
- Save user messages immediately to database
- Store assistant responses after receiving from RAG
- Include metadata: language, source documents, timestamps
- Handle message ordering with created_at timestamps

**Message Display:**
- Load messages for current thread on thread switch
- Implement infinite scroll or pagination for long conversations
- Show typing indicators during assistant response generation
- Handle message failures with retry options

## RAG Integration Logic

**Edge Function Communication:**
- Call chat-with-rag edge function with: message, threadId, userId, language
- Handle streaming responses if implemented
- Manage loading states during API calls
- Implement timeout and error handling

**Conversation Context:**
- Send recent conversation history to RAG (last 5-10 messages)
- Format messages properly for RAG system
- Include language preference in RAG requests
- Handle multilingual responses appropriately

## Suggestion System

**Load Suggestions:**
- Fetch active suggestions from database on empty state
- Display suggestions as clickable buttons
- Filter suggestions by category if relevant
- Update suggestions when language changes

**Suggestion Interaction:**
- Click suggestion to auto-fill chat input
- Automatically send suggestion as message
- Track suggestion usage for analytics

## Language Management

**i18n Implementation:**
- Use react-i18next for all UI translations
- Support English, Amharic, and Oromo
- Detect browser language as fallback
- Store language preference in localStorage
- Translate all static text, buttons, labels

**Language Switching:**
- Update UI immediately when language changes
- Pass language preference to RAG system
- Ensure assistant responds in user's selected language
- Handle RTL text direction if needed

## Voice Interface Logic

**Speech-to-Text:**
- Integrate browser Web Speech API or Supabase edge function
- Show recording indicator during voice input
- Convert speech to text and populate chat input
- Handle speech recognition errors gracefully

**Text-to-Speech (Optional):**
- Read assistant responses aloud
- Control playback with play/pause buttons
- Support multiple languages/voices
- Allow users to enable/disable TTS

## Error Handling Strategy

**API Errors:**
- Show user-friendly error messages
- Implement retry mechanisms for failed requests
- Log errors for debugging without exposing to users
- Graceful degradation when services are unavailable

**Validation:**
- Validate user input before sending
- Prevent empty messages
- Handle special characters and formatting
- Sanitize input for security

**Network Issues:**
- Detect offline state
- Queue messages when offline
- Sync when connection restored
- Show connection status to user

## Performance Optimization

**Loading States:**
- Show skeletons while loading threads/messages
- Implement lazy loading for message history
- Cache frequently accessed data
- Debounce user input and API calls

**Memory Management:**
- Limit message history in memory
- Clean up event listeners
- Optimize re-renders with React.memo and useCallback
- Implement proper cleanup in useEffect hooks

## Security Logic

**Data Validation:**
- Validate all user inputs
- Prevent XSS and injection attacks
- Sanitize message content before display
- Implement proper CORS headers

**Access Control:**
- Verify user ownership of threads/messages
- Use RLS policies for database security
- Don't expose sensitive information in errors
- Implement rate limiting for API calls

## State Management

**Local State:**
- Current thread ID
- Message list for active thread
- Loading states
- User input text
- Language preference

**Context State:**
- Authentication status
- User information
- Theme/preferences
- Global error state

**Persistence:**
- Save draft messages locally
- Persist language preference
- Cache thread list
- Store user preferences