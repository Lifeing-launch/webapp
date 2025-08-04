-- Migration: Enable realtime for forum tables
-- Description: Adds forum tables to the supabase_realtime publication for real-time updates
-- This enables live updates for posts, comments, messages, and group memberships

-- Enable realtime for core forum tables
alter publication supabase_realtime add table forum.posts;
alter publication supabase_realtime add table forum.comments;
alter publication supabase_realtime add table forum.messages;
alter publication supabase_realtime add table forum.group_members;
alter publication supabase_realtime add table forum.anonymous_profiles;

-- Enable realtime for likes/reactions (for live count updates)
alter publication supabase_realtime add table forum.likes;

-- Optional: Add any other forum-related tables that might need realtime
-- alter publication supabase_realtime add table forum.notifications;
-- alter publication supabase_realtime add table forum.user_stats; 