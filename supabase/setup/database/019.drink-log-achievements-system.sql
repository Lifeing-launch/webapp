-- Migration: Drink Log Achievements System
-- Description: Comprehensive achievements/badges system for drink logging
-- This system tracks user achievements, badges, and provides idempotent recompute functionality

-- 1. Catálogo de badges e conquistas do usuário

-- 10. Catálogo de Badges
CREATE TABLE IF NOT EXISTS drink_log.badges (
  id           SERIAL PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,         -- ex.: 'alcohol_free_day', 'daily_target', ...
  name         TEXT NOT NULL,                -- ex.: 'Alcohol Free Day'
  description  TEXT,
  icon_url     TEXT,
  scope        TEXT NOT NULL CHECK (scope IN ('daily','weekly','monthly','none')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Conquistas do Usuário (1 linha por ocorrência)
CREATE TABLE IF NOT EXISTS drink_log.user_badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  badge_id       INT  NOT NULL REFERENCES drink_log.badges(id),
  period_key     TEXT NOT NULL,               -- diário: 'YYYY-MM-DD'; semanal: data do domingo ('YYYY-MM-DD'); mensal: 'YYYY-MM'
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  goal_snapshot  JSONB NOT NULL,              -- metas vigentes no momento da concessão
  metrics        JSONB,                       -- agregados: { "total_drinks": 3, ... }
  UNIQUE(user_id, badge_id, period_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON drink_log.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON drink_log.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON drink_log.user_badges(earned_at DESC);

-- Seeds de badges
INSERT INTO drink_log.badges (code, name, description, icon_url, scope)
VALUES
  ('alcohol_free_day', 'Alcohol Free Day', 'Um dia inteiro sem consumo.', '/drink-log/alcohol-free-day.png', 'daily'),
  ('daily_target',     'Daily Target Badge', 'Meta diária atingida.', '/drink-log/daily-target.png', 'daily'),
  ('weekly_target',    'Weekly Target Badge', 'Meta semanal atingida (domingo–sábado).', '/drink-log/weekly-goal-met.png', 'weekly'),
  ('monthly_target',   'Monthly Target Badge', 'Meta mensal atingida (mês calendário).', '/drink-log/monthly-target.png', 'monthly')
ON CONFLICT (code) DO NOTHING;

-- 2. Snapshots de metas (para congelar "meta vigente no período")

-- 12. Versões de metas (linha a cada mudança)
CREATE TABLE IF NOT EXISTS drink_log.goals_snapshots (
  id             BIGSERIAL PRIMARY KEY,
  goal_id        UUID NOT NULL REFERENCES drink_log.goals(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  effective_from TIMESTAMPTZ NOT NULL,
  daily_goal     INT NOT NULL,
  weekly_goal    INT NOT NULL,
  monthly_goal   INT NOT NULL
);

-- Trigger: insere snapshot no INSERT de goals
CREATE OR REPLACE FUNCTION drink_log.trg_goals_insert_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO drink_log.goals_snapshots (goal_id, user_id, effective_from, daily_goal, weekly_goal, monthly_goal)
  VALUES (NEW.id, NEW.user_id, NEW.created_at, NEW.daily_goal, NEW.weekly_goal, NEW.monthly_goal);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_goals_insert_snapshot ON drink_log.goals;
CREATE TRIGGER trg_goals_insert_snapshot
AFTER INSERT ON drink_log.goals
FOR EACH ROW EXECUTE FUNCTION drink_log.trg_goals_insert_snapshot();

-- Trigger: insere snapshot a cada UPDATE de goals
CREATE OR REPLACE FUNCTION drink_log.trg_goals_update_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO drink_log.goals_snapshots (goal_id, user_id, effective_from, daily_goal, weekly_goal, monthly_goal)
  VALUES (NEW.id, NEW.user_id, now(), NEW.daily_goal, NEW.weekly_goal, NEW.monthly_goal);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_goals_update_snapshot ON drink_log.goals;
CREATE TRIGGER trg_goals_update_snapshot
AFTER UPDATE ON drink_log.goals
FOR EACH ROW EXECUTE FUNCTION drink_log.trg_goals_update_snapshot();

-- Helper: retorna metas vigentes em 'p_at'
CREATE OR REPLACE FUNCTION drink_log.get_goal_snapshot_at(p_user_id uuid, p_at timestamptz)
RETURNS TABLE(daily_goal int, weekly_goal int, monthly_goal int) AS $$
BEGIN
  RETURN QUERY
  SELECT s.daily_goal, s.weekly_goal, s.monthly_goal
    FROM drink_log.goals g
    JOIN drink_log.goals_snapshots s ON s.goal_id = g.id
   WHERE g.user_id = p_user_id
     AND s.effective_from <= p_at
   ORDER BY s.effective_from DESC
   LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Funções de período (considerando domingo–sábado e fuso do Brasil)

-- Considera 'America/Sao_Paulo' como timezone de corte do dia
CREATE OR REPLACE FUNCTION drink_log.local_date(p_ts timestamptz)
RETURNS date AS $$
  SELECT (p_ts AT TIME ZONE 'America/Sao_Paulo')::date;
$$ LANGUAGE sql IMMUTABLE;

-- Retorna o domingo (start) da semana do instante informado
CREATE OR REPLACE FUNCTION drink_log.week_sunday(p_ts timestamptz)
RETURNS date AS $$
  WITH d AS (
    SELECT drink_log.local_date(p_ts) AS d,
           EXTRACT(DOW FROM (p_ts AT TIME ZONE 'America/Sao_Paulo'))::int AS dow
  )
  SELECT d.d - d.dow::int FROM d;  -- domingo = 0
$$ LANGUAGE sql IMMUTABLE;

-- 4. Concessão de badges (award) — idempotente

-- Alcohol Free Day: 1 linha por dia com 0 consumo
CREATE OR REPLACE FUNCTION drink_log.award_alcohol_free_days(p_from date, p_to date)
RETURNS integer AS $$
DECLARE
  v_user uuid := auth.uid();
  v_badge_id int;
  v_inserted int := 0;
BEGIN
  SELECT id INTO v_badge_id FROM drink_log.badges WHERE code='alcohol_free_day' AND active IS TRUE;
  IF v_badge_id IS NULL THEN RETURN 0; END IF;

  WITH days AS (
    SELECT d::date AS d
      FROM generate_series(p_from, p_to, interval '1 day') g(d)
  ),
  agg AS (
    SELECT drink_log.local_date(e.drank_at) AS d, COALESCE(SUM(e.quantity),0) AS total
      FROM drink_log.entries e
     WHERE e.user_id = v_user
     GROUP BY 1
  ),
  zeros AS (
    SELECT d.d AS day0
      FROM days d
 LEFT JOIN agg a ON a.d = d.d
     WHERE COALESCE(a.total,0) = 0
  ),
  ins AS (
    INSERT INTO drink_log.user_badges (user_id, badge_id, period_key, period_start, period_end, earned_at, goal_snapshot, metrics)
    SELECT v_user,
           v_badge_id,
           to_char(z.day0, 'YYYY-MM-DD'),
           z.day0,
           z.day0,
           (z.day0 + time '23:59:59')::timestamptz,
           COALESCE( to_jsonb( (SELECT row_to_json(gs) FROM drink_log.get_goal_snapshot_at(v_user, (z.day0 + time '23:59:59')::timestamptz) gs) ), '{}'::jsonb ),
           jsonb_build_object('total_drinks', 0)
      FROM zeros z
 ON CONFLICT (user_id, badge_id, period_key) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM ins;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

-- Daily Target: soma(dia) > 0 e <= meta diária vigente no fim do dia
CREATE OR REPLACE FUNCTION drink_log.award_daily_target(p_from date, p_to date)
RETURNS integer AS $$
DECLARE
  v_user uuid := auth.uid();
  v_badge_id int;
  v_inserted int := 0;
BEGIN
  SELECT id INTO v_badge_id FROM drink_log.badges WHERE code='daily_target' AND active IS TRUE;
  IF v_badge_id IS NULL THEN RETURN 0; END IF;

  WITH days AS (
    SELECT d::date AS d
      FROM generate_series(p_from, p_to, interval '1 day') g(d)
  ),
  day_sum AS (
    SELECT drink_log.local_date(e.drank_at) AS d, SUM(e.quantity) AS total
      FROM drink_log.entries e
     WHERE e.user_id = v_user
     GROUP BY 1
  ),
  cand AS (
    SELECT ds.d,
           ds.total,
           (SELECT daily_goal FROM drink_log.get_goal_snapshot_at(v_user, (ds.d + time '23:59:59')::timestamptz)) AS goal_d
      FROM day_sum ds
  ),
  ok AS (
    SELECT c.*
      FROM cand c
     WHERE c.total > 0 AND c.goal_d IS NOT NULL AND c.total <= c.goal_d
  ),
  ins AS (
    INSERT INTO drink_log.user_badges (user_id, badge_id, period_key, period_start, period_end, earned_at, goal_snapshot, metrics)
    SELECT v_user,
           v_badge_id,
           to_char(o.d, 'YYYY-MM-DD'),
           o.d,
           o.d,
           (o.d + time '23:59:59')::timestamptz,
           jsonb_build_object(
             'daily_goal', (SELECT daily_goal FROM drink_log.get_goal_snapshot_at(v_user, (o.d + time '23:59:59')::timestamptz)),
             'weekly_goal', (SELECT weekly_goal FROM drink_log.get_goal_snapshot_at(v_user, (o.d + time '23:59:59')::timestamptz)),
             'monthly_goal',(SELECT monthly_goal FROM drink_log.get_goal_snapshot_at(v_user, (o.d + time '23:59:59')::timestamptz))
           ),
           jsonb_build_object('total_drinks', o.total)
      FROM ok o
 ON CONFLICT (user_id, badge_id, period_key) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM ins;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

-- Weekly Target: domingo–sábado
CREATE OR REPLACE FUNCTION drink_log.award_weekly_target(p_from date, p_to date)
RETURNS integer AS $$
DECLARE
  v_user uuid := auth.uid();
  v_badge_id int;
  v_inserted int := 0;
BEGIN
  SELECT id INTO v_badge_id FROM drink_log.badges WHERE code='weekly_target' AND active IS TRUE;
  IF v_badge_id IS NULL THEN RETURN 0; END IF;

  WITH e AS (
    SELECT e.*, drink_log.week_sunday(e.drank_at) AS sun_start
      FROM drink_log.entries e
     WHERE e.user_id = v_user
       AND drink_log.local_date(e.drank_at) BETWEEN p_from AND p_to
  ),
  sumw AS (
    SELECT sun_start AS week_start, (sun_start + 6) AS week_end, SUM(quantity) AS total
      FROM e
     GROUP BY 1
  ),
  cand AS (
    SELECT w.*,
           (SELECT weekly_goal FROM drink_log.get_goal_snapshot_at(v_user, (w.week_end + time '23:59:59')::timestamptz)) AS goal_w
      FROM sumw w
  ),
  ok AS (
    SELECT * FROM cand WHERE goal_w IS NOT NULL AND total <= goal_w
  ),
  ins AS (
    INSERT INTO drink_log.user_badges (user_id, badge_id, period_key, period_start, period_end, earned_at, goal_snapshot, metrics)
    SELECT v_user,
           v_badge_id,
           to_char(o.week_start, 'YYYY-MM-DD'),
           o.week_start,
           o.week_end,
           (o.week_end + time '23:59:59')::timestamptz,
           jsonb_build_object(
             'weekly_goal', o.goal_w
           ),
           jsonb_build_object('total_drinks', o.total)
      FROM ok o
 ON CONFLICT (user_id, badge_id, period_key) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM ins;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

-- Monthly Target: mês calendário
CREATE OR REPLACE FUNCTION drink_log.award_monthly_target(p_from date, p_to date)
RETURNS integer AS $$
DECLARE
  v_user uuid := auth.uid();
  v_badge_id int;
  v_inserted int := 0;
BEGIN
  SELECT id INTO v_badge_id FROM drink_log.badges WHERE code='monthly_target' AND active IS TRUE;
  IF v_badge_id IS NULL THEN RETURN 0; END IF;

  WITH e AS (
    SELECT e.*, date_trunc('month', e.drank_at AT TIME ZONE 'America/Sao_Paulo')::date AS month_start
      FROM drink_log.entries e
     WHERE e.user_id = v_user
       AND drink_log.local_date(e.drank_at) BETWEEN p_from AND p_to
  ),
  summ AS (
    SELECT month_start, (month_start + (INTERVAL '1 month - 1 day'))::date AS month_end, SUM(quantity) AS total
      FROM e
     GROUP BY 1
  ),
  cand AS (
    SELECT m.*,
           (SELECT monthly_goal FROM drink_log.get_goal_snapshot_at(v_user, (m.month_end + time '23:59:59')::timestamptz)) AS goal_m
      FROM summ m
  ),
  ok AS (
    SELECT * FROM cand WHERE goal_m IS NOT NULL AND total <= goal_m
  ),
  ins AS (
    INSERT INTO drink_log.user_badges (user_id, badge_id, period_key, period_start, period_end, earned_at, goal_snapshot, metrics)
    SELECT v_user,
           v_badge_id,
           to_char(o.month_start, 'YYYY-MM'),
           o.month_start,
           o.month_end,
           (o.month_end + time '23:59:59')::timestamptz,
           jsonb_build_object('monthly_goal', o.goal_m),
           jsonb_build_object('total_drinks', o.total)
      FROM ok o
 ON CONFLICT (user_id, badge_id, period_key) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM ins;

  RETURN v_inserted;
END;
$$ LANGUAGE plpgsql;

-- Orquestrador (idempotente) – roda para um range e retorna total inserido
CREATE OR REPLACE FUNCTION drink_log.award_badges(p_from date, p_to date)
RETURNS TABLE(inserted_count int) AS $$
DECLARE
  i1 int; i2 int; i3 int; i4 int;
BEGIN
  SELECT drink_log.award_alcohol_free_days(p_from, p_to) INTO i1;
  SELECT drink_log.award_daily_target       (p_from, p_to) INTO i2;
  SELECT drink_log.award_weekly_target      (p_from, p_to) INTO i3;
  SELECT drink_log.award_monthly_target     (p_from, p_to) INTO i4;
  RETURN QUERY SELECT COALESCE(i1,0)+COALESCE(i2,0)+COALESCE(i3,0)+COALESCE(i4,0);
END;
$$ LANGUAGE plpgsql;

-- 5. RLS

-- Badges (catálogo): leitura para autenticados
ALTER TABLE drink_log.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY badges_read ON drink_log.badges
  FOR SELECT USING (true);

-- User Badges: cada um vê só os seus
ALTER TABLE drink_log.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_badges_select ON drink_log.user_badges
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_badges_insert ON drink_log.user_badges
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Snapshots: leitura restrita (opcional; só via funções)
ALTER TABLE drink_log.goals_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_snapshots_select ON drink_log.goals_snapshots
  FOR SELECT USING (user_id = auth.uid());