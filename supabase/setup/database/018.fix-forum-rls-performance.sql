-- Migration: Fix RLS performance and security issues
-- Description: Optimizes RLS policies by wrapping auth.uid() calls in SELECT statements,
-- removes duplicate policies, and fixes remaining security issues to improve query performance at scale
-- This addresses Supabase Linter warnings for auth_rls_initplan, multiple_permissive_policies, and rls_disabled_in_public

-- =============================================================================
-- FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- =============================================================================

-- Fix forum.anonymous_profiles policies
ALTER POLICY "Read anonymous profiles" ON forum.anonymous_profiles
USING ((select auth.role()) = 'authenticated');

ALTER POLICY "Insert own profile" ON forum.anonymous_profiles
WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY "Update own profile" ON forum.anonymous_profiles
USING (user_id = (select auth.uid()));

ALTER POLICY "Delete own profile" ON forum.anonymous_profiles
USING (user_id = (select auth.uid()));

-- Fix forum.posts policies
ALTER POLICY "Read approved or own posts" ON forum.posts
USING (
  status='approved' or
  author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
);

ALTER POLICY "Insert if member or general forum" ON forum.posts
WITH CHECK (
  group_id is null or
  exists(
    select 1 from forum.group_members gm
    where gm.anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
      and gm.group_id = forum.posts.group_id 
      and gm.is_approved = true
  )
);

ALTER POLICY "Update own posts" ON forum.posts
USING (author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Delete own posts" ON forum.posts
USING (author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

-- Fix forum.comments policies
ALTER POLICY "Read approved or own comments" ON forum.comments
USING (
  status='approved' or
  author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
);

ALTER POLICY "Insert comment if post visible" ON forum.comments
WITH CHECK (
  exists(
    select 1 from forum.posts p
    where p.id = post_id and (
      p.status='approved' or
      p.author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
    )
  )
);

ALTER POLICY "Update own comments" ON forum.comments
USING (author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Delete own comments" ON forum.comments
USING (author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

-- Fix forum.likes policies
ALTER POLICY "Like visible post" ON forum.likes
WITH CHECK (
  exists(select 1 from forum.posts p where p.id=post_id and p.status='approved')
  and anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
);

ALTER POLICY "Remove own like" ON forum.likes
USING (anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Read own likes" ON forum.likes
USING (anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

-- Fix forum.messages policies
ALTER POLICY "Sender or receiver can read" ON forum.messages
USING (
  sender_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())) or
  receiver_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
);

ALTER POLICY "Only sender inserts" ON forum.messages
WITH CHECK (sender_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Sender can delete own sent" ON forum.messages
USING (sender_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Receiver can update seen_at" ON forum.messages
USING (receiver_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

-- Fix forum.groups policies
ALTER POLICY "Owner can update" ON forum.groups
USING (owner_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Owner can delete" ON forum.groups
USING (owner_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Any authenticated user can create groups" ON forum.groups
WITH CHECK ((select auth.role()) = 'authenticated');

-- Fix forum.group_members policies
ALTER POLICY "Read approved memberships and own requests" ON forum.group_members
USING (
  is_approved = true
  OR
  anon_profile_id IN (
    SELECT id FROM forum.anonymous_profiles WHERE user_id = (select auth.uid())
  )
  OR
  group_id IN (
    SELECT g.id FROM forum.groups g
    WHERE g.owner_anon_id IN (
      SELECT id FROM forum.anonymous_profiles WHERE user_id = (select auth.uid())
    )
  )
);

ALTER POLICY "Insert self" ON forum.group_members
WITH CHECK (anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Owner can update" ON forum.group_members
USING (
  (select owner_anon_id from forum.groups g where g.id=group_id) =
  (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
);

ALTER POLICY "Self can leave group" ON forum.group_members
USING (anon_profile_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

-- Fix forum.categories policies
ALTER POLICY "Categories insert authenticated" ON forum.categories
WITH CHECK ((select auth.role()) = 'authenticated');

-- Fix forum.tags policies
ALTER POLICY "Tags insert authenticated" ON forum.tags
WITH CHECK ((select auth.role()) = 'authenticated');

-- Fix forum.post_tags policies
ALTER POLICY "Post tags insert by post author" ON forum.post_tags
WITH CHECK (
  exists(
    select 1 from forum.posts p
    where p.id = post_id and p.author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
  )
);

ALTER POLICY "Post tags delete by post author" ON forum.post_tags
USING (
  exists(
    select 1 from forum.posts p
    where p.id = post_id and p.author_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid()))
  )
);

-- Fix forum.moderation_log policies
ALTER POLICY "Moderation log read by reviewer" ON forum.moderation_log
USING (reviewer_anon_id = (select id from forum.anonymous_profiles where user_id=(select auth.uid())));

ALTER POLICY "Moderation log insert by authenticated" ON forum.moderation_log
WITH CHECK ((select auth.role()) = 'authenticated');

-- =============================================================================
-- FIX MULTIPLE PERMISSIVE POLICIES ISSUES
-- =============================================================================

-- Remove duplicate policies from forum.anonymous_profiles
-- Drop the old policies that are duplicated
DROP POLICY IF EXISTS "Self insert" ON forum.anonymous_profiles;
DROP POLICY IF EXISTS "Self update" ON forum.anonymous_profiles;

-- Remove the duplicate policy "group_members_simple_select" that causes multiple permissive policies warning
DROP POLICY IF EXISTS "group_members_simple_select" ON forum.group_members;

-- =============================================================================
-- FIX DRINK_LOG SCHEMA POLICIES (also mentioned in the linter)
-- =============================================================================

-- Fix drink_log.entries policies
ALTER POLICY "entries_select" ON drink_log.entries
USING (user_id = (select auth.uid()));

ALTER POLICY "entries_insert" ON drink_log.entries
WITH CHECK (user_id = (select auth.uid()));

-- Fix drink_log.goals policies
ALTER POLICY "goals_select" ON drink_log.goals
USING (user_id = (select auth.uid()));

ALTER POLICY "goals_insert" ON drink_log.goals
WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY "goals_update" ON drink_log.goals
USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

-- Fix drink_log.goals_history policies
ALTER POLICY "goals_history_select" ON drink_log.goals_history
USING (
  EXISTS (
    SELECT 1 FROM drink_log.goals 
    WHERE goals.id = goals_history.goal_id 
    AND goals.user_id = (select auth.uid())
  )
);

ALTER POLICY "goals_history_insert" ON drink_log.goals_history
WITH CHECK (
  EXISTS (
    SELECT 1 FROM drink_log.goals 
    WHERE goals.id = goals_history.goal_id 
    AND goals.user_id = (select auth.uid())
  )
);

-- =============================================================================
-- FIX PUBLIC SCHEMA POLICIES (also mentioned in the linter)
-- =============================================================================

-- Fix public.user_profiles policies (remove duplicate UPDATE policy)
-- The linter shows both "Enable select for authenticated users only" and "Enable update for authenticated users only"
-- for UPDATE action, but "Enable select for authenticated users only" should only be for SELECT
-- Let's ensure the correct policies are in place

-- First, let's check if we need to drop and recreate the problematic policy
-- The "Enable select for authenticated users only" policy should only apply to SELECT, not UPDATE
-- This is likely a misconfiguration in the original setup

-- Recreate the correct policies for user_profiles
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.user_profiles;

-- Create the correct policies
CREATE POLICY "Enable select for authenticated users only" ON public.user_profiles
FOR SELECT TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Enable update for authenticated users only" ON public.user_profiles
FOR UPDATE TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- =============================================================================
-- FIX RLS DISABLED IN PUBLIC - DRINK_LOG CATALOG TABLES
-- =============================================================================

-- These are catalog/reference tables that should be readable by all authenticated users
-- but still need RLS enabled for security compliance
-- Note: The policies already exist from migration 009, we just need to enable RLS

-- Enable RLS on drink_log catalog tables (policies already exist)
ALTER TABLE drink_log.drink_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log.drink_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for catalog tables if they don't exist
-- These should be readable by all authenticated users
DO $$
BEGIN
  -- Create policy for drink_types if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'drink_log' 
    AND tablename = 'drink_types' 
    AND policyname = 'drink_types_read_all'
  ) THEN
    CREATE POLICY "drink_types_read_all" ON drink_log.drink_types
      FOR SELECT USING ((select auth.role()) = 'authenticated');
  END IF;

  -- Create policy for drink_brands if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'drink_log' 
    AND tablename = 'drink_brands' 
    AND policyname = 'drink_brands_read_all'
  ) THEN
    CREATE POLICY "drink_brands_read_all" ON drink_log.drink_brands
      FOR SELECT USING ((select auth.role()) = 'authenticated');
  END IF;

  -- Create policy for moods if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'drink_log' 
    AND tablename = 'moods' 
    AND policyname = 'moods_read_all'
  ) THEN
    CREATE POLICY "moods_read_all" ON drink_log.moods
      FOR SELECT USING ((select auth.role()) = 'authenticated');
  END IF;

  -- Create policy for triggers if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'drink_log' 
    AND tablename = 'triggers' 
    AND policyname = 'triggers_read_all'
  ) THEN
    CREATE POLICY "triggers_read_all" ON drink_log.triggers
      FOR SELECT USING ((select auth.role()) = 'authenticated');
  END IF;

  -- Create policy for locations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'drink_log' 
    AND tablename = 'locations' 
    AND policyname = 'locations_read_all'
  ) THEN
    CREATE POLICY "locations_read_all" ON drink_log.locations
      FOR SELECT USING ((select auth.role()) = 'authenticated');
  END IF;
END
$$;

-- Add table comments to clarify these are catalog/reference tables
COMMENT ON TABLE drink_log.drink_types IS 'Catalog table for drink types with standard volumes and alcohol percentages';
COMMENT ON TABLE drink_log.drink_brands IS 'Catalog table for drink brands organized by type';
COMMENT ON TABLE drink_log.moods IS 'Catalog table for mood options in drink logging';
COMMENT ON TABLE drink_log.triggers IS 'Catalog table for trigger options in drink logging';
COMMENT ON TABLE drink_log.locations IS 'Catalog table for location options in drink logging'; 