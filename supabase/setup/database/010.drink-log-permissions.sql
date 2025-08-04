-- Migration: Drink Log Schema Permissions
-- Description: Grant necessary permissions to anon, authenticated, and service_role for drink_log schema
-- This ensures proper access to tables, functions, and sequences in the drink_log schema

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA drink_log TO anon, authenticated, service_role;

-- 2. Grant full access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA drink_log TO anon, authenticated, service_role;

-- 3. Grant full access to routines (functions and triggers)
GRANT ALL ON ALL ROUTINES IN SCHEMA drink_log TO anon, authenticated, service_role;

-- 4. Grant full access to sequences (for SERIAL/UUID defaults)
GRANT ALL ON ALL SEQUENCES IN SCHEMA drink_log TO anon, authenticated, service_role;

-- 5. Ensure new objects inherit privileges
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA drink_log
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA drink_log
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA drink_log
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role; 