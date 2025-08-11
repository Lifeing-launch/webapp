-- Migration: Add user roles functionality
-- Description: Create roles table, add role_id to user_profiles, and update active_subscriptions view
-- to provide automatic subscriptions for internal users

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the "internal" role
INSERT INTO roles (name, description) VALUES ('internal', 'Internal users who have automatic access without payment');

-- Add role_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_user_profiles_role_id ON user_profiles(role_id);

-- Drop the existing view first to avoid column mapping conflicts
DROP VIEW IF EXISTS active_subscriptions;

-- First, ensure all plan_id values are valid integers
-- This will fail if any plan_id values are not numeric
UPDATE subscriptions 
SET plan_id = plan_id::INTEGER::TEXT 
WHERE plan_id IS NOT NULL;

-- Convert the column type from VARCHAR to INT
ALTER TABLE subscriptions 
ALTER COLUMN plan_id TYPE INTEGER USING plan_id::INTEGER;

-- Create the active_subscriptions view to include internal users with virtual subscriptions
CREATE VIEW active_subscriptions AS
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

-- Add virtual subscriptions for internal users who don't have real subscriptions
SELECT 
    gen_random_uuid() as id,
    up.id as user_id,
    'internal_' || up.id as stripe_subscription_id,
    'internal_' || up.id as stripe_customer_id,
    'internal_price' as stripe_price_id,
    0.00 as amount,
    999 as plan_id, -- Virtual plan ID for internal users
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
    r.name as role_name
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE up.role_id IS NOT NULL
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



-- Add RLS policies for roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own role
CREATE POLICY "Users can read their own role"
ON roles FOR SELECT
TO authenticated
USING (id = (
    SELECT up.role_id 
    FROM user_profiles up 
    WHERE up.id = (select auth.uid())
));

-- Add comment to document the changes
COMMENT ON TABLE roles IS 'User roles table for managing internal vs external users';
COMMENT ON COLUMN user_profiles.role_id IS 'Foreign key to roles table. NULL means external user, non-NULL means internal user with specific role';
COMMENT ON VIEW active_subscriptions IS 'Updated view to include internal users with virtual subscriptions via UNION ALL'; 