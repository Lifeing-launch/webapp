-- Migration: Add UPDATE policy for user_profiles table
-- This allows authenticated users to update their own profile data

CREATE POLICY "Enable update for authenticated users only"
ON "public"."user_profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);