# Supabase Cron Jobs Setup Guide

This guide explains how to set up and manage secrets for your Supabase cron jobs using Supabase Vault.

## Prerequisites

- Supabase project with pg_cron extension enabled
- Access to your Supabase project's SQL Editor or psql
- Your project's URL and anon key

## 📋 Overview

Your Supabase cron jobs need secure access to your project's API endpoints. This guide shows you how to:

1. Store your project credentials securely in Supabase Vault
2. Set up scheduled cron jobs that use these credentials
3. Manage and update your stored secrets

## 🔐 Step 1: Enable pg_cron Extension

First, ensure that the pg_cron extension is enabled in your Supabase project. See the [official Supabase cron documentation](https://supabase.com/docs/guides/cron) for details. Also ensure that the pg_net extension is enabled in your project. See the [documentation](https://supabase.com/docs/guides/database/extensions/pg_net) for more details.

## 🗝️ Step 2: Store Your Credentials in Supabase Vault

### Initial Setup (Run Once)

Run these commands in your Supabase SQL Editor to store your project credentials:

```sql
-- Store your project URL
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');

-- Store your anon key
select vault.create_secret('YOUR_SUPABASE_ANON_KEY', 'anon_key');
```

**Replace the following values:**

- `YOUR_PROJECT_REF` - Your actual Supabase project reference (found in your project URL)
- `YOUR_SUPABASE_ANON_KEY` - Your project's anon key (found in Settings → API)

### ✅ Verify Your Secrets

To check that your secrets were stored correctly:

```sql
-- View all your secrets (encrypted)
select * from vault.secrets;

-- View decrypted secrets (be careful - only run in secure environment)
select id, name, decrypted_secret from vault.decrypted_secrets;
```

## 🔄 Step 3: Update Existing Secrets

If you need to update your stored credentials:

### Find the Secret to Update

```sql
-- Get the UUID of the secret you want to update
select id, name from vault.secrets;
```

### Update the Secret

```sql
-- Update with the UUID from the query above
SELECT vault.update_secret(
    'paste-uuid-here',
    'https://your-new-project-url.supabase.co'
);
```

**Example for updating anon key:**

```sql
SELECT vault.update_secret(
    'paste-uuid-here',
    'your-new-anon-key'
);
```

## 🗑️ Step 4: Delete Secrets (If Needed)

If you need to remove secrets from the vault:

### Option 1: Delete by UUID

```sql
-- First, get the UUID
select id, name from vault.secrets;

-- Then delete using the UUID
select vault.delete_secret('paste-uuid-here');
```

### Option 2: Delete by Name

```sql
-- Delete directly by name
DELETE FROM vault.secrets WHERE name = 'project_url';
DELETE FROM vault.secrets WHERE name = 'anon_key';
```

## 📅 Step 5: Set Up Your Cron Jobs

Once your secrets are stored in the vault, you can run the schedule.sql files in your cron job directories:

1. **[cron-cleanup-retired-plans/schedule.sql](../supabase/functions/cron-cleanup-retired-plans/schedule.sql)** - Runs twice daily
2. **[cron-cleanup-strapi-orphans/schedule.sql](../supabase/functions/cron-cleanup-strapi-orphans/schedule.sql)** - Runs every minute

Run these files in your SQL Editor to schedule the cron jobs.

## 🛑 Step 6: Delete/Stop Cron Jobs

If you need to stop or delete a cron job:

### View All Scheduled Jobs

First, check what cron jobs are currently scheduled:

```sql
-- View all scheduled cron jobs
SELECT * FROM cron.job;
```

### Delete/Unschedule a Cron Job

To stop and delete a cron job, use the `cron.unschedule()` function:

```sql
-- Delete a cron job by name
SELECT cron.unschedule('cron-cleanup-retired-plans');

-- Delete a cron job by name
SELECT cron.unschedule('cron-cleanup-strapi-orphans');
```

**Important Notes:**
- `cron.unschedule()` immediately stops the job from running any further scheduled executions
- If a job is currently executing when you unschedule it, it will complete its current run but won't start new ones
- You can always re-create the job later by running the schedule SQL again

## 🔍 Monitoring Your Setup

### Check Scheduled Jobs

```sql
-- View all scheduled cron jobs
SELECT * FROM cron.job;
```

### Check Job Execution History

```sql
-- View recent job runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### View Your Secrets

```sql
-- Safe view (encrypted secrets)
select id, name, created_at from vault.secrets;

-- Decrypted view (use with caution)
select id, name, decrypted_secret from vault.decrypted_secrets;
```

## ⚠️ Security Best Practices

1. **Never expose your service role key** - Only use the anon key for cron jobs
2. **Limit access to vault.decrypted_secrets** - Only run decrypted queries in secure environments
3. **Regularly rotate your keys** - Update your anon key periodically
4. **Monitor job execution** - Check logs for any failed authentications

## 🚨 Troubleshooting

### Common Issues

**Authentication Failed:**

- Verify your anon key is correct
- Check that your project URL is accurate
- Ensure secrets are properly stored in the vault

**Cron Job Not Running:**

- Confirm pg_cron extension is enabled
- Check cron.job table for your scheduled jobs
- Review cron.job_run_details for error messages

**Secret Not Found:**

- Verify secret names match exactly ('project_url', 'anon_key')
- Check vault.secrets table to see stored secrets

### Getting Help

- Check the [Supabase Cron Documentation](https://supabase.com/docs/guides/cron)
- Review [Supabase Vault Documentation](https://supabase.com/docs/guides/database/vault)
- Check your project logs in the Supabase Dashboard
