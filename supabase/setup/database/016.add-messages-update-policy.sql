-- Migration: Add missing UPDATE policy for messages table
-- Description: Allows receivers to mark messages as read (update seen_at field)
-- This adds the missing update policy needed for marking messages as read
-- 
-- Problem: The original schema had RLS policies for select, insert, and delete
-- but was missing the update policy needed for marking messages as read.

create policy "Receiver can update seen_at" on forum.messages
  for update using (
    receiver_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  ); 