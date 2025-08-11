-- Migration: Add subscription whitelist functionality
-- Description: Create subscription_whitelist table and update active_subscriptions view
-- to provide automatic subscriptions for whitelisted users

-- Create subscription_whitelist table
CREATE TABLE subscription_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cutoff_datetime TIMESTAMPTZ
);

-- Create index for performance on email lookups
CREATE INDEX idx_subscription_whitelist_email ON subscription_whitelist(email);

-- Create index for cutoff datetime filtering
CREATE INDEX idx_subscription_whitelist_cutoff ON subscription_whitelist(cutoff_datetime);

-- Enable RLS for subscription_whitelist table
ALTER TABLE subscription_whitelist ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read whitelist entries (needed for the view)
CREATE POLICY "Users can read their own whitelist entry"
ON subscription_whitelist FOR SELECT
TO authenticated
USING (email = (
    SELECT up.email 
    FROM user_profiles up 
    WHERE up.id = (select auth.uid())
));

-- Create or replace the active_subscriptions view to include internal users and whitelisted users with virtual subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.id,
    s.user_id,
    s.stripe_subscription_id,
    s.stripe_customer_id,
    s.stripe_price_id,
    s.amount,
    s.plan_id,
    s.status,
    s.billing_interval,
    s.card_last4,
    s.card_type,
    s.current_period_start,
    s.current_period_end,
    s.trial_start,
    s.trial_end,
    s.canceled_at,
    s.cancel_at,
    s.failed_at,
    s.created_at,
    s.updated_at,
    r.id as role_id,
    r.name as role_name
FROM subscriptions s
INNER JOIN user_profiles up ON s.user_id = up.id
LEFT JOIN roles r ON up.role_id = r.id
WHERE
    s.status IN ('active','trialing')
    OR (
        s.failed_at IS NOT NULL
        AND now() < s.failed_at + INTERVAL '14 days'
    )

UNION ALL

-- Add virtual subscriptions for internal users and whitelisted users who don't have real subscriptions
SELECT 
    gen_random_uuid() as id,
    up.id as user_id,
    CASE 
        WHEN up.role_id IS NOT NULL THEN 'internal_' || up.id
        ELSE 'whitelist_' || up.id
    END as stripe_subscription_id,
    CASE 
        WHEN up.role_id IS NOT NULL THEN 'internal_' || up.id
        ELSE 'whitelist_' || up.id
    END as stripe_customer_id,
    CASE 
        WHEN up.role_id IS NOT NULL THEN 'internal_price'
        ELSE 'whitelist_price'
    END as stripe_price_id,
    0.00 as amount,
    CASE 
        WHEN up.role_id IS NOT NULL THEN 999 -- Virtual plan ID for internal users
        ELSE 998 -- Virtual plan ID for whitelisted users
    END as plan_id,
    'active' as status,
    'month' as billing_interval,
    NULL as card_last4,
    NULL as card_type,
    now() as current_period_start,
    now() + INTERVAL '50 years' as current_period_end,
    NULL as trial_start,
    NULL as trial_end,
    NULL as canceled_at,
    NULL as cancel_at,
    NULL as failed_at,
    now() as created_at,
    now() as updated_at,
    r.id as role_id,
    CASE 
        WHEN up.role_id IS NOT NULL THEN r.name
        ELSE 'whitelisted'
    END as role_name
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
LEFT JOIN subscription_whitelist sw ON up.email = sw.email
WHERE (
    -- Internal users with roles
    up.role_id IS NOT NULL
    OR 
    -- Whitelisted users with valid cutoff dates
    (sw.email IS NOT NULL AND (sw.cutoff_datetime IS NULL OR now() < sw.cutoff_datetime))
)
AND NOT EXISTS (
    SELECT 1 FROM subscriptions s2 
    WHERE s2.user_id = up.id 
    AND (
        s2.status IN ('active','trialing')
        OR (
            s2.failed_at IS NOT NULL
            AND now() < s2.failed_at + INTERVAL '14 days'
        )
    )
);

-- Fix the security context of the active_subscriptions view
ALTER VIEW public.active_subscriptions SET (security_invoker = true);

-- Add comments to document the changes
COMMENT ON TABLE subscription_whitelist IS 'Table for managing subscription whitelist - users who get automatic access without payment';
COMMENT ON COLUMN subscription_whitelist.email IS 'Unique email address of the whitelisted user';
COMMENT ON COLUMN subscription_whitelist.cutoff_datetime IS 'Optional cutoff date after which the whitelist entry expires. NULL means no expiration';
COMMENT ON VIEW active_subscriptions IS 'Updated view to include internal users and whitelisted users with virtual subscriptions via UNION ALL'; 