-- Migration: Fix user profiles function search path security issue
-- Description: Set explicit search path for fn_update_user_profile_on_auth_users_change function
-- This prevents search path manipulation and ensures consistent behavior for user profile synchronization

-- Fix the search path for the user profiles trigger function
ALTER FUNCTION public.fn_update_user_profile_on_auth_users_change()
SET search_path = public, pg_temp;

-- Add a comment to document this security improvement
COMMENT ON FUNCTION public.fn_update_user_profile_on_auth_users_change() IS 'Trigger function to sync auth.users with user_profiles. Uses explicit search path (public, pg_temp) for security.'; 