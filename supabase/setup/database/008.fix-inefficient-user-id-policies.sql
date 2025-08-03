-- Migration: Fix inefficient user_id policies in RLS
-- Description: Optimize RLS policies by wrapping auth.uid() calls in SELECT statements
-- This prevents re-evaluation of auth.uid() for each row, improving query performance at scale

-- Fix RSVPS table policies
ALTER POLICY "Users can read their own rsvps" ON public.rsvps
USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can delete their own rsvps" ON public.rsvps
USING (user_id = (select auth.uid()));

ALTER POLICY "Users can insert their own rsvps" ON public.rsvps
WITH CHECK (user_id = (select auth.uid()));

-- Fix BOOKMARKS table policies
ALTER POLICY "Users can read their own bookmarks" ON public.bookmarks
USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can delete their own bookmarks" ON public.bookmarks
USING (user_id = (select auth.uid()));

ALTER POLICY "Users can insert their own bookmarks" ON public.bookmarks
WITH CHECK (user_id = (select auth.uid()));

-- Fix SUBSCRIPTIONS table policies
ALTER POLICY "Users can view their subscriptions" ON public.subscriptions
USING (user_id = (select auth.uid()));

ALTER POLICY "Users can update their subscriptions" ON public.subscriptions
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Fix USER_PROFILES table policies
ALTER POLICY "Enable update for authenticated users only" ON public.user_profiles
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Add comments to document this performance optimization
COMMENT ON POLICY "Users can read their own rsvps" ON public.rsvps IS 'Optimized RLS policy using SELECT wrapper for auth.uid() to prevent re-evaluation per row';
COMMENT ON POLICY "Users can read their own bookmarks" ON public.bookmarks IS 'Optimized RLS policy using SELECT wrapper for auth.uid() to prevent re-evaluation per row';
COMMENT ON POLICY "Users can view their subscriptions" ON public.subscriptions IS 'Optimized RLS policy using SELECT wrapper for auth.uid() to prevent re-evaluation per row';
COMMENT ON POLICY "Enable update for authenticated users only" ON public.user_profiles IS 'Optimized RLS policy using SELECT wrapper for auth.uid() to prevent re-evaluation per row';
