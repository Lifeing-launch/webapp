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
  ('MindfulDrinking'),
  ('AFDays'),
  ('EmotionalWellness'),
  ('Relationships'),
  ('HabitChange'),
  ('Neurodivergence'),
  ('Resilience'),
  ('Midlife'),
  ('Spirituality'),
  ('Gratitude'),
  ('CopingSkills'),
  ('BodyImage'),
  ('Boundaries'),
  ('PlayAndJoy'),
  ('SleepMatters'),
  ('30DayChallenge'),
  ('Reset'),
  ('DryJuly'),
  ('MindfulMay'),
  ('FunWithoutAlcohol'),
  ('SelfCompassionChallenge'),
  ('NeedSupport'),
  ('CelebratingWins'),
  ('Accountability'),
  ('FeelingStuck'),
  ('CravingsAndTriggers'),
  ('ReflectionPrompt'),
  ('JustSharing'),
  ('Lonely');

-- 1. Anonymous profiles
INSERT INTO forum.anonymous_profiles (user_id, nickname) VALUES
  ('439f8456-44e9-476b-b2c4-25c8c8bd5cf3', 'lifeing_admin')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Groups
INSERT INTO forum.groups (name, description, group_type, owner_anon_id) VALUES
  ('Open Minds', 'A safe space for open and positive conversations', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Moms United', 'Support group for mothers to share and connect', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Productivity Squad', 'Tips, wins, and daily motivation for a productive life', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Anxiety Warriors', 'Private group for anxiety support and encouragement', 'private',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  -- Identity / Experience-Based Groups
  ('50+ Lifeing', 'Community for members 50 and above', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Neurodivergent Navigators', 'For those managing ADHD, autism, or sensory needs', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Caregivers', 'Support space for caregivers', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Queer & Thriving', 'LGBTQIA+', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('BIPOC/BAME', 'Ethnic minorities, indigenous, people of color, Asian, and Black', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Chronic Pain Management', 'Strategies and support for chronic pain', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Creatives/creators', 'Space for creative expression and makers', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  -- Challenge & Practice-Based Groups
  ('AF Days Accountability', 'Accountability group for alcohol-free days', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Live More Drink Less - Alcohol Reduction 101', 'Foundations and support for reducing alcohol', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Morning Ritual Circle', 'Daily routines and morning practices', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('30 day Mindfulness Challenge', '30-day mindfulness practice', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Weekly Intention Setting', 'Set weekly intentions together', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3')),
  ('Creative Journaling Collective', 'Prompts and community for creative journaling', 'public',
    (SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3'))
ON CONFLICT (id) DO NOTHING;

-- 3. Group members (owners)
INSERT INTO forum.group_members (anon_profile_id, group_id, is_approved, role)
SELECT ap.id, g.id, true, 'owner'
FROM forum.anonymous_profiles ap
JOIN forum.groups g ON g.owner_anon_id = ap.id
ON CONFLICT DO NOTHING;

-- 4. Group members (regular members)
INSERT INTO forum.group_members (anon_profile_id, group_id, is_approved, role) VALUES
  ((SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3'), 
   (SELECT id FROM forum.groups WHERE name = 'Productivity Squad'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3'), 
   (SELECT id FROM forum.groups WHERE name = 'Open Minds'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3'), 
   (SELECT id FROM forum.groups WHERE name = 'Anxiety Warriors'), true, 'member'),
  ((SELECT id FROM forum.anonymous_profiles WHERE user_id = '439f8456-44e9-476b-b2c4-25c8c8bd5cf3'), 
   (SELECT id FROM forum.groups WHERE name = 'Moms United'), true, 'member')
ON CONFLICT DO NOTHING;
