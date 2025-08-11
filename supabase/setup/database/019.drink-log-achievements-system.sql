-- ========================
-- DRINK LOG ACHIEVEMENTS SYSTEM
-- ========================
-- ONE badge per goal period. New period starts when goals change.

-- 1. Create badges table
CREATE TABLE IF NOT EXISTS drink_log.badges (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  scope TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create user_badges table
CREATE TABLE IF NOT EXISTS drink_log.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  badge_id INT NOT NULL REFERENCES drink_log.badges(id),
  period_key TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  goal_snapshot JSONB NOT NULL,
  metrics JSONB,
  UNIQUE(user_id, badge_id, period_key)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON drink_log.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON drink_log.user_badges(badge_id);

-- 4. Enable RLS
ALTER TABLE drink_log.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_select_all" ON drink_log.badges;
CREATE POLICY "badges_select_all" ON drink_log.badges FOR SELECT USING (true);

ALTER TABLE drink_log.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_own" ON drink_log.user_badges;
CREATE POLICY "user_badges_own" ON drink_log.user_badges 
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Insert badges
INSERT INTO drink_log.badges (code, name, description, scope, icon_url)
VALUES 
  ('alcohol_free_period', 'Alcohol Free Period', 'At least one day with zero drinks in goal period', 'period', ' /drink-log/alcohol-free-day.png'),
  ('daily_target', 'Daily Target Achievement', 'All logged days within daily target for goal period', 'daily', '/drink-log/daily-target.png'),
  ('weekly_target', 'Weekly Target Achievement', 'Average weekly consumption within target for goal period', 'weekly', '/drink-log/monthly-target.png'),
  ('monthly_target', 'Monthly Target Achievement', 'Average monthly consumption within target for goal period', 'monthly', '/drink-log/weekly-goal-met.png')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = true;

-- 6. Ensure goals have updated_at properly set
UPDATE drink_log.goals SET updated_at = created_at WHERE updated_at IS NULL;

-- 7. Create trigger to update goals.updated_at when goals change
CREATE OR REPLACE FUNCTION drink_log.update_goal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.daily_goal IS DISTINCT FROM NEW.daily_goal OR
      OLD.weekly_goal IS DISTINCT FROM NEW.weekly_goal OR 
      OLD.monthly_goal IS DISTINCT FROM NEW.monthly_goal) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_goal_updated_at ON drink_log.goals;
CREATE TRIGGER update_goal_updated_at
  BEFORE UPDATE ON drink_log.goals
  FOR EACH ROW EXECUTE FUNCTION drink_log.update_goal_updated_at();

-- 8. Grant permissions
GRANT USAGE ON SCHEMA drink_log TO authenticated;
GRANT SELECT ON drink_log.badges TO authenticated;
GRANT ALL ON drink_log.user_badges TO authenticated;