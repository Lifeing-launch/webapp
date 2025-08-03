-- Migration: Fix anonymous_profiles RLS policy
-- Created: 2025-01-29
-- Description: Allows authenticated users to read anonymous profiles for forum functionality

-- Remove the restrictive policy
DROP POLICY "Self select/update" ON forum.anonymous_profiles;

-- Create separate policies for different operations
-- Allow authenticated users to read anonymous profiles (public info)
CREATE POLICY "Read anonymous profiles" ON forum.anonymous_profiles
  FOR select USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile
CREATE POLICY "Insert own profile" ON forum.anonymous_profiles
  FOR insert WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Update own profile" ON forum.anonymous_profiles
  FOR update USING (user_id = auth.uid());

-- Allow users to delete their own profile
CREATE POLICY "Delete own profile" ON forum.anonymous_profiles
  FOR delete USING (user_id = auth.uid()); 