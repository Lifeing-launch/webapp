-- Add missing UPDATE policy for messages table
-- This allows receivers to mark messages as read (update seen_at field)
-- 
-- Problem: The original schema had RLS policies for select, insert, and delete
-- but was missing the update policy needed for marking messages as read.

create policy "Receiver can update seen_at" on forum.messages
  for update using (
    receiver_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  );