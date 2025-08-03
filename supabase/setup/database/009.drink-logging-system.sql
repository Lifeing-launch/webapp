-- Migration: Drink Logging System
-- Description: Complete drink logging system with user goals, entries, and catalog tables
-- This system allows users to track their drinking habits, set goals, and analyze patterns

-- 1. Create dedicated schema for drink logging
CREATE SCHEMA IF NOT EXISTS drink_log;

-- 2. Catalog tables (types, brands, moods, triggers and locations)
CREATE TABLE drink_log.drink_types (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE
);

CREATE TABLE drink_log.drink_brands (
  id               SERIAL PRIMARY KEY,
  drink_type_id    INT NOT NULL REFERENCES drink_log.drink_types(id),
  name             TEXT NOT NULL
);

CREATE TABLE drink_log.moods (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE
);

CREATE TABLE drink_log.triggers (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE
);

CREATE TABLE drink_log.locations (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE
);

-- 3. User goals table
CREATE TABLE drink_log.goals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  daily_goal       INT NOT NULL DEFAULT 0,
  weekly_goal      INT NOT NULL DEFAULT 0,
  monthly_goal     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Goals change history
CREATE TABLE drink_log.goals_history (
  id                   SERIAL PRIMARY KEY,
  goal_id              UUID NOT NULL REFERENCES drink_log.goals(id),
  changed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_daily       INT NOT NULL,
  previous_weekly      INT NOT NULL,
  previous_monthly     INT NOT NULL
);

-- 5. Drink consumption entries table
CREATE TABLE drink_log.entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  drank_at         TIMESTAMPTZ NOT NULL,
  drink_type_id    INT NOT NULL REFERENCES drink_log.drink_types(id),
  drink_brand_id   INT REFERENCES drink_log.drink_brands(id),
  quantity         INT NOT NULL DEFAULT 1,
  mood_id          INT REFERENCES drink_log.moods(id),
  trigger_id       INT REFERENCES drink_log.triggers(id),
  location_id      INT REFERENCES drink_log.locations(id),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Performance indexes for user and date queries
CREATE INDEX idx_entries_user_drank_at ON drink_log.entries(user_id, drank_at);
CREATE INDEX idx_entries_drank_at      ON drink_log.entries(drank_at);

-- 7. Seed data for dropdown selects
INSERT INTO drink_log.drink_types (name) VALUES
  ('Wine'),('Beer'),('Spirit'),('Cocktail'),('Other')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.drink_brands (drink_type_id, name) VALUES
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'),      'Red Wine'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'),      'Lager'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'),    'Vodka'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'),  'Mojito'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Other'),     'Cider')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.moods (name) VALUES
  ('Happy'),('Relax'),('Stress'),('Excited'),('Anxious'),('Sad'),('Energetic')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.triggers (name) VALUES
  ('Social Events'),('Stress'),('Habit'),('Celebration'),
  ('Boredom'),('Sadness'),('Work Pressure')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.locations (name) VALUES
  ('Home'),('Restaurant'),('Bar'),('Party'),
  ('Club'),('Friends House'),('Work Event')
ON CONFLICT DO NOTHING;

-- 8. Function and trigger to record goals change history
CREATE OR REPLACE FUNCTION drink_log.record_goals_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO drink_log.goals_history (
    goal_id,
    previous_daily,
    previous_weekly,
    previous_monthly
  ) VALUES (
    OLD.id,
    OLD.daily_goal,
    OLD.weekly_goal,
    OLD.monthly_goal
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_goals_history
  AFTER UPDATE ON drink_log.goals
  FOR EACH ROW
  WHEN (
    OLD.daily_goal   IS DISTINCT FROM NEW.daily_goal   OR
    OLD.weekly_goal  IS DISTINCT FROM NEW.weekly_goal  OR
    OLD.monthly_goal IS DISTINCT FROM NEW.monthly_goal
  )
  EXECUTE FUNCTION drink_log.record_goals_history();

-- 9. Enable RLS and access policies
ALTER TABLE drink_log.entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY entries_select ON drink_log.entries
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY entries_insert ON drink_log.entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE drink_log.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_select ON drink_log.goals
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY goals_insert ON drink_log.goals
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY goals_update ON drink_log.goals
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); 