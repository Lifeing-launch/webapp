-- Migration: Add 'Other' option to triggers, moods, locations and drink types
-- Description: Add 'Other' as an option for edge cases and quick logging

INSERT INTO drink_log.triggers (name) VALUES ('Other') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO drink_log.moods (name) VALUES ('Other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO drink_log.locations (name) VALUES ('Other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO drink_log.drink_types (name) VALUES ('Other')
ON CONFLICT (name) DO NOTHING;