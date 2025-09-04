-- Migration: Add DELETE policy for drink_log.entries
-- Description: Enable users to delete their own drink log entries
-- This ensures users can only delete entries they created

-- Add DELETE policy for entries table
CREATE POLICY entries_delete ON drink_log.entries
  FOR DELETE USING (user_id = auth.uid());

-- Add UPDATE policy for entries table (in case it's needed later)
CREATE POLICY entries_update ON drink_log.entries
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
