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

grant select on forum.anonymous_profiles to anon, authenticated;