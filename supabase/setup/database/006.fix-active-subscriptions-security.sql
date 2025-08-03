-- Migration: Fix active_subscriptions view security issue
-- Description: Change the active_subscriptions view from SECURITY DEFINER to SECURITY INVOKER
-- This ensures the view respects Row Level Security policies and runs with the caller's permissions

-- Fix the security context of the active_subscriptions view
ALTER VIEW public.active_subscriptions
SET (security_invoker = true);

-- Add a comment to document this change
COMMENT ON VIEW public.active_subscriptions IS 'View for active subscriptions with SECURITY INVOKER to respect RLS policies'; 