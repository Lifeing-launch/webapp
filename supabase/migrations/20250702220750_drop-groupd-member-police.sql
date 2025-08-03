-- Fix group_members RLS policy to allow reading approved memberships for counting

-- Drop existing policy that's too restrictive
drop policy if exists "Members can read group membership" on forum.group_members;

-- Create new policy that allows reading approved memberships for counting
-- but still protects pending memberships
create policy "Read approved memberships and own requests" on forum.group_members
  for select using (
    -- Anyone can see approved memberships (for counting and public info)
    is_approved = true
    OR
    -- Users can see their own membership (approved or pending)
    anon_profile_id IN (
      SELECT id FROM forum.anonymous_profiles WHERE user_id = auth.uid()
    )
    OR
    -- Group owners can see all memberships of their groups (approved and pending)
    group_id IN (
      SELECT g.id FROM forum.groups g
      WHERE g.owner_anon_id IN (
        SELECT id FROM forum.anonymous_profiles WHERE user_id = auth.uid()
      )
    )
  ); 