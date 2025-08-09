-- Migration: Seed data for lifeing lounge
-- Description: Populates initial data for forum categories, tags, and sample content
-- This provides a foundation for the lifeing lounge with realistic test data

-- =============================================================================
-- SEED DATA FOR LIFEING LOUNGE
-- =============================================================================

-- CATEGORIAS PADRÃO
INSERT INTO forum.categories (name, description) VALUES 
  ('General', 'General discussions about any life topic'),
  ('Q&A', 'Community questions and answers'),
  ('Resources', 'Useful resources and shared materials');

-- TAGS PADRÃO
INSERT INTO forum.tags (name) VALUES 
  ('Lifeing'),
  ('AdventureAwaits'),
  ('WanderlustLife'),
  ('InspireDaily'),
  ('CreateYourStory'),
  ('LiveLaughLove'),
  ('ChasingDreams'),
  ('ExploreTheWorld'),
  ('MomentsMatter');

-- 1. Anonymous profiles
INSERT INTO forum.anonymous_profiles (user_id, nickname) VALUES
  ('b0126fbc-f4a3-4127-8e29-31c04ad4f017', 'bambuhouse'),
  ('c97b21b9-f950-4027-9e0b-6a496ce34668', 'sparklebee'),
  ('37b0f722-96bb-4299-9d54-82ebc1c5727a', 'kindra'),
  ('85047888-db80-4239-83fc-65e18ec0e3f8', 'nightowl')
on conflict (user_id) do nothing;

-- 2. Groups
INSERT INTO forum.groups (name, description, group_type, owner_anon_id) VALUES
  ('Open Minds', 'A safe space for open and positive conversations', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra')),
  ('Moms United', 'Support group for mothers to share and connect', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl')),
  ('Productivity Squad', 'Tips, wins, and daily motivation for a productive life', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse')),
  ('Anxiety Warriors', 'Private group for anxiety support and encouragement', 'private',
    (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'))
ON CONFLICT (id) DO NOTHING;

-- 3. Group members (owners)
INSERT INTO forum.group_members (anon_profile_id, group_id, is_approved, role)
SELECT ap.id, g.id, true, 'owner'
FROM forum.anonymous_profiles ap
JOIN forum.groups g ON g.owner_anon_id = ap.id
ON CONFLICT DO NOTHING;

-- 4. Group members (regular members)
INSERT INTO forum.group_members (anon_profile_id, group_id, is_approved, role) VALUES
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra'), 
   (SELECT id FROM forum.groups WHERE name = 'Productivity Squad'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'), 
   (SELECT id FROM forum.groups WHERE name = 'Open Minds'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'), 
   (SELECT id FROM forum.groups WHERE name = 'Anxiety Warriors'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'), 
   (SELECT id FROM forum.groups WHERE name = 'Moms United'), true, 'member')
ON CONFLICT DO NOTHING;

-- 5. Posts (direct posts in groups and general forum)
-- Posts in groups
INSERT INTO forum.posts (group_id, author_anon_id, category_id, title, content, status) VALUES
  -- Open Minds group
  ((SELECT id FROM forum.groups WHERE name = 'Open Minds'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra'),
   (SELECT id FROM forum.categories WHERE name = 'General'),
   'Welcome to Open Minds!',
   'Welcome everyone! Let''s make this a space for positive and real talk. 🚀 Share your thoughts, ask questions, and connect with like-minded people.',
   'approved'),
  
  -- Moms United group
  ((SELECT id FROM forum.groups WHERE name = 'Moms United'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'),
   (SELECT id FROM forum.categories WHERE name = 'General'),
   'Motherhood Challenges',
   'Motherhood is tough, but together we are stronger. Any tips for managing anxiety as a new mom? Would love to hear your experiences.',
   'approved'),
  
  -- Productivity Squad group
  ((SELECT id FROM forum.groups WHERE name = 'Productivity Squad'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'),
   (SELECT id FROM forum.categories WHERE name = 'General'),
   'Let''s Share Our Wins!',
   'What''s one productivity win you had this week? Let''s celebrate our achievements together! 🎉',
   'approved'),
  
  -- Anxiety Warriors group
  ((SELECT id FROM forum.groups WHERE name = 'Anxiety Warriors'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'),
   (SELECT id FROM forum.categories WHERE name = 'General'),
   'Daily Support Thread',
   'This is our daily check-in space. How are you feeling today? Remember, you''re not alone in this journey.',
   'approved')
ON CONFLICT DO NOTHING;

-- Posts in general forum (group_id = null)
INSERT INTO forum.posts (group_id, author_anon_id, category_id, title, content, status) VALUES
  -- General forum posts
  (null,
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra'),
   (SELECT id FROM forum.categories WHERE name = 'General'),
   'New to the Community!',
   'Hi everyone! I''m new here and excited to connect with you all. What''s the best way to get started?',
   'approved'),
  
  (null,
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'),
   (SELECT id FROM forum.categories WHERE name = 'Q&A'),
   'Looking for Book Recommendations',
   'Can anyone recommend good books about mindfulness and personal growth? I''m looking to expand my reading list.',
   'approved'),
  
  (null,
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'),
   (SELECT id FROM forum.categories WHERE name = 'Resources'),
   'Morning Routine Ideas',
   'What does your morning routine look like? I''m trying to build better habits and would love some inspiration!',
   'approved')
ON CONFLICT DO NOTHING;

-- 6. Comments on posts
INSERT INTO forum.comments (post_id, author_anon_id, content, status) VALUES
  -- Comment on "Welcome to Open Minds!"
  ((SELECT id FROM forum.posts WHERE title = 'Welcome to Open Minds!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'),
   'Thanks for creating this space! Looking forward to meaningful conversations.',
   'approved'),
  
  -- Comment on "Motherhood Challenges"
  ((SELECT id FROM forum.posts WHERE title = 'Motherhood Challenges'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'),
   'Meditation apps helped me a lot during the early months. Also, don''t hesitate to ask for help!',
   'approved'),
  
  -- Comment on "New to the Community!"
  ((SELECT id FROM forum.posts WHERE title = 'New to the Community!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'),
   'Welcome! I''d suggest checking out the different groups - there''s something for everyone.',
   'approved'),
  
  -- Comment on "Looking for Book Recommendations"
  ((SELECT id FROM forum.posts WHERE title = 'Looking for Book Recommendations'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'),
   'The Power of Now by Eckhart Tolle is amazing! Changed my perspective completely.',
   'approved')
ON CONFLICT DO NOTHING;

-- 7. Likes on posts
INSERT INTO forum.likes (post_id, anon_profile_id) VALUES
  -- Likes on "Welcome to Open Minds!"
  ((SELECT id FROM forum.posts WHERE title = 'Welcome to Open Minds!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee')),
  ((SELECT id FROM forum.posts WHERE title = 'Welcome to Open Minds!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl')),
  
  -- Likes on "New to the Community!"
  ((SELECT id FROM forum.posts WHERE title = 'New to the Community!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse')),
  ((SELECT id FROM forum.posts WHERE title = 'New to the Community!'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee')),
  
  -- Likes on "Morning Routine Ideas"
  ((SELECT id FROM forum.posts WHERE title = 'Morning Routine Ideas'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra')),
  ((SELECT id FROM forum.posts WHERE title = 'Morning Routine Ideas'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'))
ON CONFLICT DO NOTHING;

-- 8. Post tags
INSERT INTO forum.post_tags (post_id, tag_id) VALUES
  -- Tag posts with relevant tags
  ((SELECT id FROM forum.posts WHERE title = 'Welcome to Open Minds!'),
   (SELECT id FROM forum.tags WHERE name = 'Lifeing')),
  ((SELECT id FROM forum.posts WHERE title = 'Welcome to Open Minds!'),
   (SELECT id FROM forum.tags WHERE name = 'InspireDaily')),
  
  ((SELECT id FROM forum.posts WHERE title = 'Let''s Share Our Wins!'),
   (SELECT id FROM forum.tags WHERE name = 'CreateYourStory')),
  ((SELECT id FROM forum.posts WHERE title = 'Let''s Share Our Wins!'),
   (SELECT id FROM forum.tags WHERE name = 'MomentsMatter')),
  
  ((SELECT id FROM forum.posts WHERE title = 'Morning Routine Ideas'),
   (SELECT id FROM forum.tags WHERE name = 'LiveLaughLove')),
  ((SELECT id FROM forum.posts WHERE title = 'Morning Routine Ideas'),
   (SELECT id FROM forum.tags WHERE name = 'ChasingDreams'))
ON CONFLICT DO NOTHING;

-- 9. Sample direct messages
INSERT INTO forum.messages (sender_anon_id, receiver_anon_id, content, status) VALUES
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'kindra'),
   'Hey! Thanks for the warm welcome to the Open Minds group. Looking forward to our discussions!',
   'approved'),
  
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'nightowl'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'),
   'Your comment about meditation apps was really helpful. Could you share which ones you recommend?',
   'approved'),
  
  ((SELECT id FROM forum.anonymous_profiles WHERE nickname = 'bambuhouse'),
   (SELECT id FROM forum.anonymous_profiles WHERE nickname = 'sparklebee'),
   'I saw your post in the Anxiety Warriors group. That''s a really supportive community you''ve built!',
   'approved')
ON CONFLICT DO NOTHING; 