# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Development

```bash
# Build Docker image
make build

# Run development server in Docker
make run-dev

# Run shell in container
make shell

# View logs
make logs
```

### Testing & Quality

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Run CI pipeline (format + lint + test)
npm run ci
```

### Database & Services

```bash
# Supabase CLI commands
npm run supabase

# Generate Supabase types
npm run supabase:types

# Stripe CLI for webhooks
npm run stripe:webhook
```

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query for server state
- **Testing**: Jest + React Testing Library
- **Type Safety**: TypeScript with strict mode

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected routes requiring auth
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── community-forum/  # Forum-specific components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── services/             # API service layer
├── typing/               # TypeScript type definitions
├── utils/                # Utility functions
└── middleware.ts         # Next.js middleware
```

### Key Architectural Patterns

#### Authentication Flow

- Uses Supabase Auth with middleware-based session management
- Anonymous profiles for forum participation
- Protected routes in `(protected)` folder with automatic redirection

#### Forum Architecture

The forum system is built with a modular service architecture:

- **BaseForumService**: Common functionality (auth, profiles, error handling)
- **ProfileService**: Anonymous profile management
- **PostService**: Post operations with realtime updates
- **CommentService**: Comment operations with realtime updates
- **MessageService**: Direct messaging (CRUD only)
- **GroupService**: Group operations and membership management

Services are located in `src/services/forum/` with centralized export from `index.ts`.

#### Database Layer

- **Supabase Client**: Server-side client with cookie-based auth
- **Admin Client**: Service role client for privileged operations
- **RLS Policies**: Row-level security for data access control
- **Realtime**: Real-time subscriptions for posts and comments

#### State Management

- **TanStack Query**: Server state management with caching
- **React Query Keys**: Structured query invalidation
- **Optimistic Updates**: For better UX in forum interactions

### Key Components

#### Forum Components (`src/components/community-forum/`)

- **ForumView**: Main forum container with tabs
- **ForumPostList**: Infinite scroll post listing
- **ForumPostCard**: Individual post display
- **CommentSection**: Nested comment system
- **DMView**: Direct messaging interface
- **GroupsView**: Group management interface

#### Authentication Components (`src/components/auth/`)

- **LoginForm**: Email/password login
- **SignupForm**: User registration
- **ResetPasswordForm**: Password reset flow
- **VerifyEmailForm**: Email verification

#### Layout Components (`src/components/layout/`)

- **AppSidebar**: Navigation sidebar
- **Header**: Top navigation
- **PageTemplate**: Common page layout

### Data Flow

#### Forum Data Flow

1. Components use custom hooks (`use-forum.tsx`, `use-infinite-posts.tsx`)
2. Hooks call service methods from `src/services/forum/`
3. Services interact with Supabase client
4. Realtime updates trigger React Query invalidation
5. UI automatically updates with new data

#### Authentication Data Flow

1. Middleware checks session on each request
2. Protected routes redirect to login if unauthenticated
3. ClientAuthListener handles client-side auth state changes
4. Anonymous profiles created for forum participation

### Testing Approach

- **Unit Tests**: Service layer and utility functions
- **Component Tests**: React components with RTL
- **Integration Tests**: API routes and database operations
- **Coverage**: Configured with Jest coverage reporting

### Development Guidelines

#### File Organization

- Use `@/` import alias for src directory
- Group related components in feature folders
- Keep types in `src/typing/` organized by domain
- Place utility functions in `src/utils/` with tests

#### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js and Prettier integration
- Tailwind CSS for styling
- shadcn/ui components for consistent design

#### Database Operations

- Always use RLS policies for data access
- Prefer service layer over direct Supabase calls
- Handle authentication state properly
- Use admin client only for privileged operations

#### Performance Considerations

- Implement infinite scroll for large datasets
- Use React Query for caching and background updates
- Optimize images with Next.js Image component
- Minimize bundle size with tree shaking

## Important Notes

- The forum system uses anonymous profiles for user privacy
- All database operations should respect RLS policies
- Realtime subscriptions are used for posts and comments
- Docker setup is available for consistent development environment
- The project is deployed on Vercel with automatic deployments from main branch
