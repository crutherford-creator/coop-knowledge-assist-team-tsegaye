# User Interface Requirements

## Design System

**Use CoopBank of Oromia Brand Colors:**
- Primary: #00adef (main brand blue)
- Secondary: #000000 (black)
- Accent: #e38524 (orange)
- Create semantic color tokens in index.css using HSL format
- Use design system tokens, not direct colors in components

**Typography:**
- Use Inter font family
- Clear hierarchy with bold headings
- High contrast for accessibility
- Responsive text scaling

## Page Structure Required

### 1. Landing Page (/)

**Header Component:**
- Logo and "CoopBank of Oromia" title with subtitle "Customer Support Assistant"
- Language switcher (EN/አማ/OR dropdown)
- Authentication status: "Sign In" button OR "Go to Chat" + "Sign Out" buttons

**Hero Section:**
- Large title: "Welcome to CoopBank Assistant"
- Subtitle about 24/7 banking support in multiple languages
- Primary CTA: "Get Started" button
- Secondary CTA: "Learn More" button
- Gradient background using brand colors

**Features Grid (3 columns):**
- Globe icon: "Multilingual Support" - Chat in English, Amharic, or Oromo
- MessageSquare icon: "Instant Answers" - 24/7 responses to banking questions
- Shield icon: "Secure & Reliable" - Bank-grade security with accurate information

### 2. Authentication Page (/auth)

**Layout:**
- Centered card on gradient background
- Back to home link in top-left
- Language switcher in top-right

**Authentication Forms:**
- Tabs for "Sign In" and "Sign Up"
- Email and password fields with proper labels
- Sign up includes password confirmation
- "Forgot Password?" link switches to reset form
- Loading states with disabled buttons
- Error handling with alert messages

**Password Reset:**
- Separate form for email entry
- Success message after sending reset email
- Back to sign in option

### 3. Chat Interface (/chat)

**Layout Structure:**
- Left sidebar (280px) for chat threads
- Main chat area taking remaining space
- Header at top of main area
- Messages area with scroll
- Input area at bottom

**Chat Header:**
- Bot avatar with "CB" fallback
- "CoopBank Assistant" title and "Always here to help" subtitle
- Language switcher, voice interface button, options menu
- Options include: Clear Chat, Sign Out

**Sidebar (Chat Threads):**
- "Chat History" title with "+" new chat button
- Scrollable list of previous conversations
- Each thread shows: title, last message preview, timestamp
- Highlight current active thread
- Truncate long text with ellipsis

**Messages Display:**
- User messages: right-aligned, blue background, white text
- Assistant messages: left-aligned with bot avatar, muted background
- Timestamps in small text below each message
- Streaming text animation for assistant responses
- Source document references when available

**Empty State:**
- Large MessageSquare icon
- Welcome message and description
- Grid of suggested question buttons from database
- Questions should be clickable to start conversation

**Chat Input:**
- Textarea that expands (min 50px, max 200px)
- Placeholder: "Ask me anything about banking..."
- Voice input button and send button in bottom-right
- Enter to send, Shift+Enter for new line
- Disable when loading

## Component Requirements

### Language Switcher
- Select dropdown with 3 options: EN, አማ, OR
- Persist selection in localStorage
- Update all UI text when changed

### Voice Interface
- Microphone button that toggles recording state
- Red color when actively recording
- Integration with speech-to-text functionality

### Streaming Text
- Animate text appearance character by character
- Smooth typing effect for assistant responses

### Responsive Design

**Mobile (< 768px):**
- Hide sidebar by default
- Add hamburger menu to show/hide sidebar
- Stack elements vertically
- Touch-optimized button sizes

**Tablet (768px - 1024px):**
- Show sidebar but allow collapse
- Maintain side-by-side layout
- Adjust spacing and padding

**Desktop (> 1024px):**
- Full sidebar always visible
- Optimal reading widths
- Hover states and smooth transitions

## Accessibility Requirements

- Proper semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast ratios
- Screen reader friendly
- Focus indicators on all interactive elements

## Animation Guidelines

- Smooth transitions (300ms cubic-bezier)
- Subtle hover effects on buttons
- Loading skeletons for chat messages
- Page transition animations
- Micro-interactions for better UX

## Error Handling

- Toast notifications for success/error messages
- Inline validation for forms
- Graceful degradation when features fail
- Clear error messages in user's language
- Retry mechanisms for failed operations