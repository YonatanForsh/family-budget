# Family Budget App (תקציב המשפחה)

## Overview

A Hebrew-language family budget management web application with gamified motivation. The app helps families track expenses, manage budget categories, and stay motivated through encouraging messages. It features a colorful, professional UI with RTL (Right-to-Left) layout support, budget visualization through charts, a "borrow" feature to move funds between categories, configurable monthly reset dates, and motivational feedback when logging expenses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state (caching, mutations, invalidation)
- **UI Components**: Shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode support
- **Charts**: Recharts for budget visualizations (pie charts, progress indicators)
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod resolvers for validation
- **Fonts**: Heebo and Rubik (Hebrew-friendly Google Fonts)
- **Layout**: Entire app wrapped in `dir="rtl"` for Hebrew RTL support
- **PWA**: Service worker and manifest.json for installable progressive web app

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via `tsx` in development
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Route Contracts**: Shared route definitions in `shared/routes.ts` with Zod schemas for input validation and response types
- **Build**: esbuild for server bundling, Vite for client bundling (via `script/build.ts`)

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Tables**:
  - `users` - User accounts (required for Replit Auth)
  - `sessions` - Session storage (required for Replit Auth)
  - `categories` - Budget categories with name, budget limit, color, and user reference
  - `expenses` - Individual expenses with amount, description, date, category, and user reference
  - `settings` - Per-user settings (budget reset day)

### Authentication
- **Method**: Replit Auth via OpenID Connect (OIDC)
- **Session Store**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Flow**: Login redirects to `/api/login`, user info at `/api/auth/user`
- **Middleware**: `isAuthenticated` middleware protects all API routes
- **User Identification**: Uses `req.user.claims.sub` as the user ID

### Shared Code
- The `shared/` directory contains code used by both frontend and backend:
  - `schema.ts` - Drizzle table definitions and Zod insert schemas
  - `routes.ts` - API route contracts (paths, methods, input/output schemas)
  - `models/auth.ts` - Auth-related table definitions

### Key Design Decisions
1. **Shared route contracts**: API endpoints are defined once in `shared/routes.ts` with Zod schemas, ensuring type safety across client and server
2. **Auto-seeding**: Default budget categories are automatically created for new users on first access
3. **Numeric as string**: Budget amounts stored as PostgreSQL `numeric` type, represented as strings in JavaScript to avoid floating-point issues
4. **Hebrew-first**: All UI text, motivational messages, and date formatting use Hebrew locale

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **Replit Auth (OIDC)**: Authentication provider using OpenID Connect, requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables
- **Google Fonts**: Heebo and Rubik font families loaded via CDN
- **Replit Vite Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, and `@replit/vite-plugin-dev-banner` for development experience on Replit