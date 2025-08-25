-- Migration: Drink Logging System
-- Description: Complete drink logging system with user goals, entries, and catalog tables
-- This system allows users to track their drinking habits, set goals, and analyze patterns

-- 1. Create dedicated schema for drink logging
CREATE SCHEMA IF NOT EXISTS drink_log;

-- 2. Catalog tables (types, brands, moods, triggers and locations)
CREATE TABLE drink_log.drink_types (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL UNIQUE,
  standard_volume_ml    INT NOT NULL DEFAULT 0,  -- Standard volume in ml (e.g., 330ml for beer)
  alcohol_percentage    DECIMAL(4,2) NOT NULL DEFAULT 0.00  -- Alcohol content in % (e.g., 5.00 for beer)
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
  volume_ml        INT NOT NULL DEFAULT 0,  -- Actual volume consumed in ml
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
INSERT INTO drink_log.drink_types (name, standard_volume_ml, alcohol_percentage) VALUES
  ('Wine', 175, 12.00),      -- 175ml (1 standard glass) with 12% alcohol
  ('Beer', 330, 5.00),       -- 330ml (1 can/bottle) with 5% alcohol
  ('Spirit', 44, 40.00),     -- 44ml (1 shot) with 40% alcohol
  ('Cocktail', 200, 15.00),  -- 200ml (1 cocktail) with 15% alcohol
  ('Liqueur', 30, 25.00),    -- 30ml (1 shot) with 25% alcohol
  ('Fortified Wine', 60, 18.00), -- 60ml (1 serving) with 18% alcohol
  ('Cider', 330, 4.50),      -- 330ml (1 bottle) with 4.5% alcohol
  ('Sake', 180, 15.00),      -- 180ml (1 serving) with 15% alcohol
  ('Mead', 250, 12.00),      -- 250ml (1 serving) with 12% alcohol
  ('Other', 330, 5.00)       -- 330ml standard with 5% alcohol
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.drink_brands (drink_type_id, name) VALUES
  -- Wine brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Red Wine'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'White Wine'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Rosé Wine'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Sparkling Wine'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Prosecco'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Champagne'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Pinot Noir'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Cabernet Sauvignon'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Chardonnay'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Sauvignon Blanc'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Merlot'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Wine'), 'Malbec'),
  
  -- Beer brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Lager'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Pilsner'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Ale'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Stout'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Porter'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'IPA'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Wheat Beer'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Pale Ale'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Brown Ale'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Sour Beer'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Belgian Ale'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Beer'), 'Hefeweizen'),
  
  -- Spirit brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Vodka'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Whiskey'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Bourbon'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Scotch'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Rum'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Gin'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Tequila'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Brandy'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Cognac'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Absinthe'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Mezcal'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Rye Whiskey'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Irish Whiskey'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Spirit'), 'Canadian Whiskey'),
  
  -- Cocktail brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Mojito'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Margarita'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Martini'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Manhattan'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Old Fashioned'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Negroni'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Daiquiri'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Gin & Tonic'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Whiskey Sour'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Bloody Mary'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Cosmopolitan'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Pina Colada'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Long Island Iced Tea'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Screwdriver'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cocktail'), 'Tom Collins'),
  
  -- Liqueur brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Baileys'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Kahlua'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Grand Marnier'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Cointreau'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Amaretto'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Frangelico'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Chambord'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Midori'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Sambuca'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Limoncello'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Drambuie'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Liqueur'), 'Benedictine'),
  
  -- Fortified Wine brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Fortified Wine'), 'Port'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Fortified Wine'), 'Sherry'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Fortified Wine'), 'Madeira'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Fortified Wine'), 'Vermouth'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Fortified Wine'), 'Marsala'),
  
  -- Cider brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Cider'), 'Apple Cider'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cider'), 'Pear Cider'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cider'), 'Berry Cider'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cider'), 'Dry Cider'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Cider'), 'Sweet Cider'),
  
  -- Sake brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Sake'), 'Junmai'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Sake'), 'Ginjo'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Sake'), 'Daiginjo'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Sake'), 'Nigori'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Sake'), 'Honjozo'),
  
  -- Mead brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Mead'), 'Traditional Mead'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Mead'), 'Melomel'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Mead'), 'Cyser'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Mead'), 'Pyment'),
  ((SELECT id FROM drink_log.drink_types WHERE name='Mead'), 'Metheglin'),
  
  -- Other brands
  ((SELECT id FROM drink_log.drink_types WHERE name='Other'), 'Cider')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.moods (name) VALUES
  ('Happy'),('Relaxed'),('Stressed'),('Excited'),('Anxious'),('Sad'),('Energetic'), ('Other')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.triggers (name) VALUES
  ('Social Events'),('Stress'),('Habit'),('Celebration'),
  ('Boredom'),('Sadness'),('Work Pressure'), ('Other')
ON CONFLICT DO NOTHING;

INSERT INTO drink_log.locations (name) VALUES
  ('Home'),('Restaurant'),('Bar'),('Party'),
  ('Club'),('Friends House'),('Work Event'), ('Other')
ON CONFLICT DO NOTHING;

-- 8. Function to calculate standard drinks
CREATE OR REPLACE FUNCTION drink_log.calculate_standard_drinks(
  p_volume_ml INT,
  p_alcohol_percentage DECIMAL(4,2)
)
RETURNS DECIMAL(6,2) AS $$
BEGIN
  -- Standard drink = (volume_ml * alcohol_percentage) / (14 * 100)
  -- 14g is the standard amount of pure alcohol in a "standard drink"
  RETURN ROUND((p_volume_ml * p_alcohol_percentage) / (14 * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 9. Function and trigger to record goals change history
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

-- 10. Enable RLS and access policies
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

-- Enable RLS for goals_history table
ALTER TABLE drink_log.goals_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_history_select ON drink_log.goals_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drink_log.goals 
      WHERE goals.id = goals_history.goal_id 
      AND goals.user_id = auth.uid()
    )
  );
CREATE POLICY goals_history_insert ON drink_log.goals_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drink_log.goals 
      WHERE goals.id = goals_history.goal_id 
      AND goals.user_id = auth.uid()
    )
  ); 