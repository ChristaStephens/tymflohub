# TymFlo Hub - Replit Agent Guide

## Overview

TymFlo Hub is a freemium SaaS web application with two distinct products:

1. **TymFlo Hub** — business calculators, PDF manipulation tools, productivity utilities (the existing tools suite)
2. **TymFlo Client Portal** — a done-for-you marketing portal for $500K+ business owners (at `/portal`)

**Core Purpose**: Hub delivers tools; Portal delivers a premium "marketing is handled" client experience.

### Client Portal (`/portal`)
Standalone portal designed for TymFlo's premium clients. No setup, no data entry, no learning curve.
- **Overview/Dashboard**: Pinned Quick Request box, "What TymFlo Did This Week" activity feed, 3-number metrics snapshot
- **Approvals**: Decision-free content sign-off (approve or flag only)
- **Documents**: Upload PDF/PNG/CSV and get an AI-powered plain-language summary
- **Ask TymFlo**: AI assistant with TymFlo account context (powered by OpenAI `gpt-4o-mini`)

Portal API routes are in `server/routes.ts` (prefixed `/api/portal/`). Portal data is stored in-memory (activity, metrics, approvals). Requires `OPENAI_API_KEY` env var for AI features.

**Business Model**: Always free, no registration required. Optional Pro upgrade via Stripe for advanced features.

**Technical Goals**: Sub-2s load times, PWA capabilities, accessible design, SEO optimization with dedicated landing pages per tool.

**Deployment**: Dual deployment strategy:
- **Replit**: Full-stack deployment with server-side features (auth, analytics, admin)
- **GitHub Pages**: Static deployment — all tools work client-side without a server. GitHub Actions workflow auto-deploys on push to main.

**GitHub Repository**: `ChristaStephens/tymflohub`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state, React hooks for local state
- **Styling**: TailwindCSS with custom design system based on shadcn/ui components
- **Component Library**: Radix UI primitives with custom styling (accordion, dialog, dropdown, toast, etc.)
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

**Design System**:
- Brand colors: Primary Purple (#463176), Brand Coral (#F69679)
- Typography: Inter (primary), JetBrains Mono (numbers/code)
- Component variants follow "New York" shadcn style
- Consistent spacing scale (4, 6, 8, 12, 16, 20, 24, 32)
- Custom CSS variables for theming in `index.css`

**File Structure**:
- `/client/src/pages/`: Route components (Home, Dashboard, Pricing, Login, tool pages)
- `/client/src/components/`: Reusable components (Header, Footer, ToolCard, CalculatorForm, etc.)
- `/client/src/components/ui/`: shadcn/ui components
- `/client/src/lib/`: Utility functions (queryClient, utils)
- `/client/src/hooks/`: Custom React hooks

**Key Features**:
- **41 comprehensive tools** organized by category (SmallPDF-style layout)
- SEO-rich content on tool pages: How It Works, Features, FAQ sections, Benefits banners
- SEO component for dynamic meta tags per route  
- Search autocomplete dropdown (shows up to 6 tool suggestions)
- Mobile-responsive design with dedicated mobile menu
- Component examples in `/client/src/components/examples/` for development reference

**Recent Updates (Oct 2025)**:
- Expanded from 10 to 41 tools across all categories
- Added reusable SEO content components (HowItWorks, Features, FAQSection, BenefitsBanner) in `/client/src/components/SEOContent.tsx`
- **Complete SEO content added to 8 major tool pages**: PDF Merge, Currency Converter, PDF Split, PDF Compress, Unit Converter (matching SmallPDF's extensive content style)
- Each SEO-optimized page includes: How It Works (3-step guide), Features (6 benefits with icons), FAQ Section (5+ detailed questions), Benefits Banner (upgrade CTA)
- **Full SEO implementation completed**:
  - Enhanced SEO component with Open Graph and Twitter Card meta tags
  - Dynamic meta tag management with automatic cleanup on navigation
  - robots.txt and sitemap.xml added (35 URLs covering all routes)
  - Canonical URLs and keywords added to all main pages
  - Base Open Graph/Twitter meta tags in index.html for social sharing
- **Stripe payment integration completed**:
  - Migrated from Square to Stripe Payment Links
  - Pro ($9/month) and Team ($29/month) plans integrated
  - Full end-to-end payment flow tested and working
  - Documentation in `STRIPE_SETUP.md`
- **Replit Auth integration completed (Oct 27, 2025)**:
  - Fully functional OIDC-based passwordless authentication
  - Session-based authentication with PostgreSQL session store
  - Login, logout, and protected routes working correctly
  - Dashboard displays user's first name from auth data
  - Removed all mock authentication code
  - Session cookies configured for both development (HTTP) and production (HTTPS)
  - **Dynamic authentication strategy registration**: Automatically handles ANY domain (tymflohub.com, dev domains, future custom domains)
  - **DNS error handling implemented**: Fixed "getaddrinfo EAI_AGAIN helium" transient DNS errors with automatic retry logic
    - Retry logic in OAuth callback handler (server/replitAuth.ts)
    - Retry logic in authentication setup during server startup (server/routes.ts) - up to 5 attempts with exponential backoff
  - **QA tested and confirmed**: Complete E2E authentication flow tested and passing
- **CRITICAL DATABASE FIX (Oct 27, 2025)**:
  - **Root Cause**: Local "helium" database only available in development, causing production deployment failures
  - **Solution**: Created Replit PostgreSQL database (Neon-backed) accessible in both dev and production
  - **Database**: `ep-long-wildflower-af0pzohl.c-2.us-west-2.aws.neon.tech`
  - **Migration**: Ran `npm run db:push` to create `users` and `sessions` tables
  - **Health Endpoint**: Added `/health` for deployment monitoring (tests DB connection)
  - **Stripe Keys**: Fixed environment variable fallback (STRIPE_SECRET_KEY → TESTING_STRIPE_SECRET_KEY in dev)
  - **Production Ready**: All DNS errors resolved, database migrations complete, health checks passing
- Fixed duplicate data-testid issue with section-specific identifiers in ToolCard component
- **Implemented 6 new calculator tools (Oct 31, 2025)**:
  - **Financial Calculators**: Loan Calculator, Mortgage Calculator, Investment Calculator, Compound Interest Calculator
  - **Statistics Calculators**: Mean/Median/Mode Calculator, Standard Deviation Calculator
  - All calculators follow consistent UI pattern: gradient backgrounds, purple icon badges, responsive results grids, FAQ sections
  - Fully tested and verified with E2E tests (Loan Calculator and Mean/Median/Mode Calculator validated)
  - Each tool includes proper SEO optimization, data-testid attributes, and comprehensive FAQ sections

### Backend Architecture

**Framework**: Express.js + TypeScript (Node.js)
- **Build Tool**: esbuild for server bundling
- **Development**: tsx for TypeScript execution in development
- **Logging**: Pino (referenced in build brief, not yet implemented)
- **File Handling**: Multer for multipart/form-data uploads

**API Structure**:
- `/api/pdf/merge`: PDF merging endpoint using pdf-lib
- Additional endpoints expected for other tools (split, compress, image conversion)
- In-memory storage implementation (`MemStorage`) as placeholder for database

**File Processing**:
- **PDF Operations**: pdf-lib library for manipulation
- **Image Processing**: Sharp library for conversions
- Temporary file storage in `/temp` directory
- 10MB file size limit for free tier (configurable via multer)

### Data Storage

**Current Implementation**: PostgreSQL via Drizzle ORM
- User management via `DatabaseStorage` class implementing `IStorage` interface
- Users stored in PostgreSQL users table with Replit Auth data
- Session storage using `connect-pg-simple` (PostgreSQL session store)
- Database operations: `getUser()`, `upsertUser()`

**Configured Database**: PostgreSQL via Drizzle ORM
- **ORM**: Drizzle with drizzle-zod for schema validation
- **Driver**: @neondatabase/serverless for Neon database connectivity
- **Schema Location**: `/shared/schema.ts`
- **Migrations**: Generated in `/migrations` directory via drizzle-kit

**Database Schema**:
```typescript
users table:
  - id (varchar, primary key, from Replit Auth OIDC sub claim)
  - email (text, not null)
  - firstName (text)
  - lastName (text)
  - profileImageUrl (text)
  - createdAt (timestamp, default: now())
  - updatedAt (timestamp, default: now())

sessions table:
  - sid (varchar, primary key)
  - sess (json, not null)
  - expire (timestamp, not null)
  - Managed automatically by connect-pg-simple
```

**Migration Strategy**: `npm run db:push` for schema synchronization

### Authentication & Authorization

**Implementation**: Replit Auth (OIDC-based passwordless authentication)
- Fully integrated Replit Auth using openid-client and passport
- OAuth 2.0 / OIDC flow with automatic token refresh
- User data stored in PostgreSQL users table

**Authentication Endpoints**:
- `/api/login` - Initiates Replit Auth OIDC flow
- `/api/callback` - OAuth callback handler, creates session
- `/api/logout` - Clears session and redirects to Replit logout endpoint
- `/api/auth/user` - Protected endpoint returning current authenticated user

**Session Management**:
- `connect-pg-simple` for PostgreSQL-backed sessions
- Cookie-based session tracking with Express
- Session TTL: 7 days
- Cookie security: httpOnly, secure in production only

**Frontend Auth**:
- `useAuth()` hook - Returns `{ user, isLoading, isAuthenticated }`
- User object: `{ id, email, firstName, lastName, profileImageUrl }`
- Login page auto-redirects to `/api/login`
- Dashboard protected - redirects to login if not authenticated
- Header shows Dashboard/Logout when authenticated

**Rate Limiting**:
- Planned: express-rate-limit + IP/session tracking
- Free tier: 5 operations per day
- Usage tracking components exist (LimitBadge, UpgradeNudge) but backend logic not implemented

### Build & Deployment

**Development**:
- `npm run dev`: Run development server with tsx
- Vite dev server with HMR
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal

**Production Build**:
- `npm run build`: Vite build (client) + esbuild bundle (server)
- Client output: `/dist/public`
- Server output: `/dist/index.js`
- `npm start`: Production server execution

**Environment Variables**:
- `DATABASE_URL`: Required for PostgreSQL connection
- `NODE_ENV`: development/production mode switching

### PWA Capabilities

**Planned** (per build brief): Service worker via vite-plugin-pwa
- Offline shell support
- Fast loading with caching strategies
- Not yet implemented in current codebase

## External Dependencies

### Third-Party Services

**Payment Processing**: Square
- Checkout link generation for Pro tier upgrades
- No payment vaulting in MVP

**Analytics** (Planned): Plausible or PostHog
- Snippet integration for user tracking
- Not yet implemented

**Database Hosting**: Neon (PostgreSQL)
- Serverless PostgreSQL via @neondatabase/serverless
- Requires DATABASE_URL environment variable

### Client-Side Libraries

**UI Framework**:
- React 18.x
- Wouter (routing)
- TanStack Query v5 (data fetching)
- Radix UI (30+ primitive components)

**Styling**:
- TailwindCSS v3
- class-variance-authority (component variants)
- clsx + tailwind-merge (className utilities)

**Form & Validation**:
- React Hook Form
- Zod (schema validation)
- @hookform/resolvers

**File Processing (Client)**:
- pdfjs-dist (PDF preview rendering)
- Custom PDF preview component with thumbnail generation

### Server-Side Libraries

**Core Framework**:
- Express.js
- Multer (file uploads)

**Database**:
- Drizzle ORM
- drizzle-zod
- @neondatabase/serverless
- pg (PostgreSQL driver)

**File Processing (Server)**:
- pdf-lib (PDF manipulation)
- sharp (image processing)

**Utilities**:
- nanoid (ID generation)
- date-fns (date manipulation)

### Development Tools

**Type Checking**: TypeScript 5.x with strict mode
**Testing** (Planned): Vitest (unit) + Playwright (E2E) - not yet configured
**Code Quality**: ESLint + Prettier (not visible in config but standard for TypeScript projects)
**Build Tools**: Vite 5.x, esbuild, tsx

### Asset Management

**Fonts**: Google Fonts (Inter, JetBrains Mono)
**Images**: Stored in `/attached_assets` directory
**Icons**: Lucide React icon library

### Configuration Files

- `drizzle.config.ts`: Database schema and migration configuration
- `vite.config.ts`: Frontend build and dev server settings
- `tailwind.config.ts`: Design system tokens and theme configuration
- `tsconfig.json`: TypeScript compiler options with path aliases
- `components.json`: shadcn/ui component configuration