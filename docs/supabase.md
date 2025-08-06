# Supabase Integration Guide

This document provides a comprehensive overview of how Supabase is integrated and used throughout the Lifeing webapp. Supabase serves as the backend-as-a-service platform, providing authentication, database, edge functions, and email services.

## Table of Contents

- [Overview](#overview)
- [Authentication (Supabase Auth)](#authentication-supabase-auth)
- [Database (PostgreSQL)](#database-postgresql)
- [Email Templates](#email-templates)
- [Edge Functions](#edge-functions)
- [CMS Integration](#cms-integration)
- [Security & Row Level Security](#security--row-level-security)
- [Client Configuration](#client-configuration)

## Overview

Supabase is the primary backend service for the Lifeing application, providing:

- **Authentication**: User management with email/password and OTP
- **Database**: PostgreSQL database with Row Level Security (RLS)
- **Edge Functions**: Serverless functions for background tasks and webhooks
- **Email Services**: Custom email templates for authentication flows
- **CMS Integration**: Strapi CMS data stored in Supabase under a separate schema

## Authentication (Supabase Auth)

### Overview

Supabase Auth handles all user authentication flows in the application, providing secure endpoints for signup, login, password reset, and email verification.

### Features Used

- **Email/Password Authentication**: Primary authentication method
- **One-Time Passwords (OTP)**: Email verification codes
- **Password Reset**: Secure password recovery flow
- **Session Management**: Automatic session handling with SSR support

### Implementation

#### Client Configuration

The application uses two Supabase clients for browser and server-side operations. See the implementation in:

- Browser client: [`src/utils/supabase/browser.ts`](../src/utils/supabase/browser.ts)
- Server client: [`src/utils/supabase/server.ts`](../src/utils/supabase/server.ts)

#### Authentication Flows

1. **Signup Flow**:

   - User submits email/password
   - Supabase creates user in `auth.users`
   - Trigger automatically creates profile in `user_profiles`
   - Email verification sent with OTP code

2. **Login Flow**:

   - User authenticates with email/password
   - Session created and stored in cookies
   - User redirected to protected dashboard

3. **Password Reset**:

   - User requests password reset
   - Email sent with reset link
   - User sets new password via secure link

4. **Email Verification**:
   - 6-digit OTP sent to user's email
   - User enters code to verify account
   - Account activated upon successful verification

#### Middleware Integration

Authentication is enforced via Next.js middleware. See the implementation in [`src/middleware.ts`](../src/middleware.ts) for route protection and user session management.

### Auth State Management

The application uses React Query for auth state management. See the implementation in [`src/components/providers/user-provider.tsx`](../src/components/providers/user-provider.tsx) for user authentication state handling.

## Database (PostgreSQL)

### Schema Overview

The application uses a well-structured PostgreSQL database with the following main tables:

#### Core Tables

1. **`user_profiles`** - User profile information including personal details, avatar, and dashboard cover image

   - See implementation: [`supabase/setup/database/001.user-setup.sql`](../supabase/setup/database/001.user-setup.sql)

2. **`subscriptions`** - User subscription data with Stripe integration for payment processing

   - See implementation: [`supabase/setup/database/002.app-tables.sql`](../supabase/setup/database/002.app-tables.sql)

3. **`rsvps`** - Meeting RSVPs to track user attendance for events

   - See implementation: [`supabase/setup/database/002.app-tables.sql`](../supabase/setup/database/002.app-tables.sql)

4. **`bookmarks`** - Resource bookmarks for users to save content
   - See implementation: [`supabase/setup/database/002.app-tables.sql`](../supabase/setup/database/002.app-tables.sql)

#### Views

- **`active_subscriptions`** - View for active user subscriptions with status filtering
  - See implementation: [`supabase/setup/database/002.app-tables.sql`](../supabase/setup/database/002.app-tables.sql)

### Database Functions

#### User Profile Synchronization

Function to automatically sync `auth.users` with `user_profiles` table using database triggers.

- See implementation: [`supabase/setup/database/001.user-setup.sql`](../supabase/setup/database/001.user-setup.sql)

#### Anonymous Profile Functions

Functions for managing anonymous user profiles in the forum system.

- See implementation: [`supabase/setup/database/002.app-tables.sql`](../supabase/setup/database/002.app-tables.sql)

### Migrations

The database schema is managed through numbered migration files:

- `001.user-setup.sql` - Initial user profile setup and triggers
- `002.app-tables.sql` - Core application tables (RSVPs, bookmarks, subscriptions)
- `003.cms.sql` - CMS schema creation
- `004.add-user-dashboardimage.sql` - Add dashboard cover image field
- `005.add-user-profiles-update-policy.sql` - Add update policy for user profiles
- `006.fix-active-subscriptions-security.sql` - Security fix for subscriptions view
- `007.fix-user-profiles-function-search-path.sql` - Security fix for trigger function
- `008.fix-inefficient-user-id-policies.sql` - Performance optimization for RLS policies

## Email Templates

### Overview

The application uses custom email templates for Supabase Auth flows, built with MJML for responsive design and consistent branding. For detailed information about template variables and Supabase email templates, see the [Supabase Auth Email Templates documentation](https://supabase.com/docs/guides/auth/auth-email-templates).

### Available Templates

1. **Confirm Signup** (`confirm-signup.html`)

   - Email verification during user registration
   - Uses 6-digit OTP code display
   - Template variables: `{{ .Token }}`, `{{ .SiteURL }}`

2. **Reset Password** (`reset-password.html`)

   - Password reset functionality
   - Button-based action link
   - Template variables: `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`

3. **Base Template** (`_template.html`)
   - Foundation template with Lifeing branding
   - Consistent design elements (logo, colors, typography)
   - Placeholders for customization

For comprehensive information about our email template structure, design standards, template variables, and workflow, see [`docs/email-templates.md`](./email-templates.md).

### Integration with Resend

The application can integrate with Resend for custom SMTP configuration, allowing for better email deliverability and analytics. See the [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp) for setup instructions.

## Edge Functions

### Overview

Supabase Edge Functions provide serverless compute for background tasks, webhooks, and API endpoints.

### Available Functions

#### 1. Cron Jobs

**`cron-cleanup-retired-plans`**

- **Purpose**: Clean up retired subscription plans
- **Schedule**: Runs twice daily (midnight and noon)
- **Implementation**: Calls internal API endpoint for cleanup operations

**`cron-cleanup-strapi-orphans`**

- **Purpose**: Clean up orphaned data from Strapi CMS
- **Schedule**: Runs every minute
- **Implementation**: Removes orphaned records in Supabase

For detailed cron job setup instructions, see [`docs/setup-cron.md`](./setup-cron.md).

#### 2. Webhook Handlers

**`strapi-webhook`**

- **Purpose**: Handle Strapi CMS webhook events
- **Events**: Entry deletion for meetings, resources, subscription plans
- **Actions**:
  - Delete RSVPs when meetings are deleted
  - Delete bookmarks when resources are deleted
  - Log errors when subscription plans are deleted

**`moderate-resource`**

- **Purpose**: Moderate user-generated content
- **Implementation**: Content moderation logic for resources

## CMS Integration

### Strapi CMS Integration

The application integrates with Strapi CMS, storing CMS data in a separate schema within the Supabase database.

#### Schema Setup

See the CMS schema creation in [`supabase/setup/database/003.cms.sql`](../supabase/setup/database/003.cms.sql).

#### Data Flow

1. **Content Management**: Strapi handles content creation and management
2. **Data Storage**: CMS data stored in `cms` schema in Supabase
3. **Webhook Sync**: Edge functions handle data synchronization
4. **Application Access**: Webapp reads CMS data for display

#### Webhook Integration

The `strapi-webhook` edge function handles real-time synchronization:

- Monitors Strapi events for content changes
- Maintains referential integrity in Supabase
- Cleans up orphaned data when content is deleted

## Security & Row Level Security

### Row Level Security (RLS)

All application tables have RLS enabled with user-specific policies. Here's an example of a typical RLS policy:

```sql
-- Users can only access their own profile
CREATE POLICY "Enable select for authenticated users only"
ON "public"."user_profiles"
TO authenticated
USING ((select auth.uid()) = id);
```

For the complete set of RLS policies, see the migration files in [`supabase/setup/database/`](../supabase/setup/database/).

### Security Optimizations

The application includes several security optimizations:

1. **Efficient RLS Policies**: Using `SELECT` wrapper for `auth.uid()` to prevent re-evaluation
2. **Security Invoker Views**: `active_subscriptions` view uses `SECURITY INVOKER`
3. **Explicit Search Paths**: Trigger functions use explicit search paths for security
4. **Cascade Deletes**: Proper foreign key relationships with cascade deletes

### Authentication Security

- **JWT Tokens**: Secure session management with automatic token refresh
- **Middleware Protection**: All protected routes enforced via Next.js middleware
- **API Route Protection**: Server-side authentication checks for API endpoints
- **Session Validation**: Regular session validation and cleanup

## Client Configuration

### Environment Variables

For environment variable setup and configuration, see [`docs/setup-env.md`](./setup-env.md).

### TypeScript Integration

The application uses generated TypeScript types for type safety. See the generated types in [`src/typing/generated/supabase.ts`](../src/typing/generated/supabase.ts).

### Query Patterns

The application uses React Query for data fetching with Supabase. See examples in:

- [`src/components/providers/user-provider.tsx`](../src/components/providers/user-provider.tsx) - User profile queries
- [`src/components/providers/subscription-provider.tsx`](../src/components/providers/subscription-provider.tsx) - Subscription queries
- [`src/components/meetings/rsvp-button.tsx`](../src/components/meetings/rsvp-button.tsx) - RSVP operations

## Best Practices

### Performance

- Use efficient RLS policies with `SELECT` wrappers
- Implement proper indexing on frequently queried columns
- Use React Query for caching and state management
- Optimize database queries with proper select statements

### Security

- Always enable RLS on user data tables
- Use parameterized queries to prevent SQL injection
- Validate user permissions on both client and server
- Regularly rotate API keys and secrets

### Development

- Use TypeScript for type safety
- Generate database types using Supabase CLI
- Test edge functions locally before deployment
- Monitor function execution and database performance

### Maintenance

- Regularly update Supabase dependencies
- Monitor cron job execution logs
- Review and update email templates as needed
- Keep migration files organized and documented

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Project Cron Setup Guide](./setup-cron.md)
- [Email Templates Documentation](./email-templates.md)
- [Environment Setup Guide](./setup-env.md)
