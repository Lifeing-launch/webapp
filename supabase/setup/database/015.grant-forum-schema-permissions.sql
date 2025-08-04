-- Migration: Grant forum schema permissions
-- Description: Grant necessary permissions to anon, authenticated, and service_role for forum schema
-- This ensures proper access to tables, functions, and sequences in the forum schema

-- Dar permissões para os roles acessarem o schema forum
GRANT USAGE ON SCHEMA forum TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA forum TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA forum TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA forum TO anon, authenticated, service_role;

-- Configurar privilégios padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA forum 
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA forum 
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA forum 
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Ensure anonymous profiles are readable by all authenticated users
grant select on forum.anonymous_profiles to anon, authenticated; 