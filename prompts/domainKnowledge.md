# Domain Knowledge Requirements

## Company Identity

**Organization:** CoopBank of Oromia
- A cooperative financial institution in Ethiopia
- Serves the Oromia region specifically
- Focus on community banking and accessible financial services

## System Purpose

**Create a customer support knowledge chatbot that:**
- Helps both bank employees and customers
- Accesses information from internal RAG documents
- Provides 24/7 banking support and information
- Reduces support ticket volume and improves response times

## Target Users

**Primary Users:**
1. Bank employees (customer service reps, tellers, support staff)
2. Bank customers (account holders seeking information)
3. Potential customers (researching banking services)

**User Needs:**
- Quick access to banking policies and procedures
- Real-time assistance during customer interactions
- Self-service support for common inquiries
- Consistent information delivery across all touchpoints

## Language Requirements

**Multi-language Support Required:**
- English (en) - Primary business language
- Amharic (am) - National language of Ethiopia  
- Oromo (or) - Regional language of Oromia

**Language Implementation:**
- Use react-i18next for internationalization
- Language switcher component in header
- Store language preference in localStorage
- All UI text must be translatable
- AI responses should match user's selected language

## Brand Guidelines

**Color Scheme (MUST USE EXACT COLORS):**
- Primary: #00adef (CoopBank blue)
- Secondary: #000000 (black)
- Accent: #e38524 (orange)

**Brand Personality:**
- Professional and trustworthy
- Accessible and friendly
- Community-focused
- Innovative but reliable

## Banking Domain Context

**Core Banking Services to Support:**
- Savings accounts (regular, fixed deposits, children's accounts)
- Loan products (personal, business, agricultural, microfinance)
- Digital banking (online banking, mobile banking, ATM services)
- Business services (corporate accounts, trade finance, cash management)

**Common Customer Inquiries:**
- Account opening procedures and requirements
- Interest rates and fee structures
- Loan application processes
- Digital banking troubleshooting
- Branch locations and operating hours
- Document requirements for various services

## Content Guidelines

**Communication Style:**
- Clear and concise language
- Helpful and supportive tone
- Culturally appropriate for Ethiopian context
- Professional yet approachable
- Avoid banking jargon when possible

**Security Considerations:**
- Never request or display sensitive customer information
- Provide general guidance, not account-specific details
- Direct users to secure channels for personal matters
- Maintain compliance with banking privacy regulations