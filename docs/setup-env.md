# Lifeing Webapp - Environment Setup Guide

This guide details how to set up environment configurations for the Lifeing Webapp across different environments: local, staging, and production.

## Overview

The Lifeing Webapp uses environment variables to configure different aspects of the application including:

- Next.js site configuration
- Supabase database and authentication
- Strapi CMS integration
- Stripe payment processing
- Cloudinary asset management

We maintain three environments:

- **Local**: Development environment running on your local machine
- **Staging**: Testing environment for pre-production validation
- **Production**: Live environment serving real users

## Quick Start

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Customize the `.env.local` file with your specific values (see sections below)

3. For other environments, create corresponding files:
   - `.env.staging` for staging environment
   - `.env.production` for production environment

## Environment Variables

### Site Configuration

| Variable               | Required | Description                                                                                                             |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | ✅       | Base URL of your webapp (e.g., `http://localhost:3000`, `https://staging.lifeing.services`, `https://lifeing.services`) |

### Supabase Configuration

| Variable                                 | Required | Description                                                    |
| ---------------------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`               | ✅       | Your Supabase project URL                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`          | ✅       | Your Supabase anonymous/publishable key                        |
| `NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY` | ✅       | Your Supabase service role key (server-side only)              |
| `EDGE_FUNCTION_API_KEY`                  | ✅       | Custom generated key for authenticating Edge Function requests |

### Strapi CMS Configuration

| Variable           | Required | Description                            |
| ------------------ | -------- | -------------------------------------- |
| `STRAPI_BASE_URL`  | ✅       | Base URL of your Strapi CMS instance   |
| `STRAPI_API_TOKEN` | ✅       | API token for accessing Strapi content |

### Stripe Configuration

| Variable                 | Required | Description                               |
| ------------------------ | -------- | ----------------------------------------- |
| `STRIPE_SECRET_KEY`      | ✅       | Stripe secret key (server-side only)      |
| `STRIPE_PUBLISHABLE_KEY` | ✅       | Stripe publishable key (client-side safe) |
| `STRIPE_WEBHOOK_SECRET`  | ✅       | Stripe webhook endpoint signing secret    |

### Cloudinary Configuration

| Variable                            | Required | Description                |
| ----------------------------------- | -------- | -------------------------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅       | Your Cloudinary cloud name |

## Detailed Setup Instructions

### Supabase Configuration

#### Getting Your Supabase Credentials

1. **Log in to Supabase** at [supabase.com](https://supabase.com)

2. **Navigate to your project** or create a new one if needed

3. **Get your Project URL and API Keys:**
   - Go to `Settings > API`
   - **Project URL:** Copy the URL (e.g., `https://xxxxx.supabase.co`)
   - **Publishable Key:** Use the `anon` key or the new publishable key format
   - **Service Role Key:** Use the `service_role` key or the new secret key format

**Important:**

- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the browser
- The `NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY` should never be exposed to the client

**Reference:** [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)

#### Generating Edge Function API Key

This is a custom key used within our Supabase Edge Functions to authenticate requests to the webapp.

```bash
node scripts/generate-key.js EDGE_FUNCTION_API_KEY
```

This will generate a secure base64-encoded key that you can use in your environment file.

### Strapi CMS Configuration

#### Getting Your Strapi Credentials

1. **Base URL:** This is the URL where your Strapi CMS is hosted

   - Local: `http://localhost:1337`
   - Staging: `https://staging-cms.lifeing.services`
   - Production: `https://cms.lifeing.services`

2. **API Token:** Generate a new API token in your Strapi admin panel
   - Log into Strapi admin
   - Go to `Settings > API Tokens`
   - Click `Create new API Token`
   - Set appropriate permissions for your use case
   - Copy the generated token

### Stripe Configuration

#### Getting Your Stripe Keys

1. **Log in to Stripe Dashboard** at [dashboard.stripe.com](https://dashboard.stripe.com)

2. **Get your API Keys:**

   - Go to `Developers > API keys`
   - **Publishable Key:** Copy the publishable key (starts with `pk_`)
   - **Secret Key:** Copy the secret key (starts with `sk_`)

3. **Environment-specific keys:**
   - Use **test keys** for local and staging environments
   - Use **live keys** only for production environment

**Reference:** [Stripe API Keys Documentation](https://docs.stripe.com/keys)

#### Setting Up Webhook Secret

1. **Create a webhook endpoint** in Stripe Dashboard:

   - Go to `Developers > Webhooks`
   - Click `Add endpoint`
   - Set the endpoint URL (e.g., `https://your-domain.com/api/webhooks/stripe`)
   - Select the events you want to listen for

2. **Get the signing secret:**
   - Click on your created webhook
   - Copy the `Signing secret` (starts with `whsec_`)

**Reference:** [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks?locale=en-GB)

### Cloudinary Configuration

#### Getting Your Cloudinary Cloud Name

1. **Log in to Cloudinary** at [cloudinary.com](https://cloudinary.com)

2. **Find your Cloud Name:**
   - It's displayed prominently in your dashboard
   - Also available in `Settings > Account`

**Reference:** [Cloudinary Credentials Tutorial](https://cloudinary.com/documentation/finding_your_credentials_tutorial)

## Environment-Specific Setup

### Local Environment

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Configure your local values:**

   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Use your personal Supabase project
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   EDGE_FUNCTION_API_KEY=your-generated-key

   # Use local or staging Strapi instance
   STRAPI_BASE_URL=http://localhost:1337
   STRAPI_API_TOKEN=your-strapi-token

   # Use Stripe test keys
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...

   # Use your Cloudinary account
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

### Staging Environment

1. **Create staging environment file:**

   ```bash
   cp .env.example .env.staging
   ```

2. **Configure staging values:**

   ```
   NEXT_PUBLIC_SITE_URL=https://staging.lifeing.services

   # Use staging Supabase project
   NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
   NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key
   EDGE_FUNCTION_API_KEY=staging-generated-key

   # Use staging Strapi instance
   STRAPI_BASE_URL=https://staging-cms.lifeing.services
   STRAPI_API_TOKEN=staging-strapi-token

   # Use Stripe test keys for staging
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...

   # Use staging Cloudinary settings
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

### Production Environment

1. **Create production environment file:**

   ```bash
   cp .env.example .env.production
   ```

2. **Configure production values:**

   ```
   NEXT_PUBLIC_SITE_URL=https://lifeing.services

   # Use production Supabase project
   NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
   NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=production-service-role-key
   EDGE_FUNCTION_API_KEY=production-generated-key

   # Use production Strapi instance
   STRAPI_BASE_URL=https://cms.lifeing.services
   STRAPI_API_TOKEN=production-strapi-token

   # Use Stripe live keys for production
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...

   # Use production Cloudinary settings
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

## Validation

### Verify Your Setup

1. **Check environment file:**

   ```bash
   # All required variables should be set (no "tobemodified" values)
   grep "tobemodified" .env.local
   # Should return no results
   ```

2. **Test the application:**

   ```bash
   npm run dev
   # Should start without connection errors
   ```

3. **Test integrations:**
   - Try logging in (tests Supabase Auth)
   - Load CMS content (tests Strapi integration)
   - Test payment flow (tests Stripe integration)
   - Upload an image (tests Cloudinary integration)

## Security Notes

- **Never commit `.env.*` files to version control** - they're in `.gitignore` for a reason
- **Use different keys for each environment** - never share production keys with staging/local
- **Rotate keys periodically** - especially for production environment
- **Keep service role keys secure** - they have elevated privileges
- **Use test Stripe keys** for non-production environments
- **Monitor webhook endpoints** for suspicious activity

## Troubleshooting

### Common Issues

1. **Supabase connection fails:**

   - Verify your project URL and API keys are correct
   - Check that your database schema is set up properly
   - Ensure IP restrictions (if any) allow your application

2. **Strapi content doesn't load:**

   - Verify the Strapi base URL is accessible
   - Check that your API token has sufficient permissions
   - Ensure the Strapi service is running

3. **Stripe payments fail:**

   - Verify you're using the correct keys for your environment
   - Check webhook endpoint is correctly configured
   - Ensure webhook signing secret matches

4. **Cloudinary uploads fail:**

   - Verify your cloud name is correct
   - Check upload presets are configured properly
   - Ensure account limits haven't been exceeded

5. **Environment variables not loading:**
   - Ensure you're using the correct file for your environment
   - Restart your development server after changing variables
   - Check for typos in variable names

### Getting Help

If you encounter issues:

1. Check the application logs for specific error messages
2. Verify all environment variables are properly set and have valid values
3. Test connections to external services independently
4. Consult the documentation for each service (Supabase, Strapi, Stripe, Cloudinary)
