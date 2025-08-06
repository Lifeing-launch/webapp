-- 
-- NOTE: See setup-cron.md for instructions on how to store project_url and anon_key in Supabase Vault
-- 

-- Schedule the cron-cleanup-strapi-orphans function to run every minute
select
  cron.schedule(
    'cron-cleanup-strapi-orphans',
    '* * * * *', -- Every minute
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/cron-cleanup-strapi-orphans',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
          ),
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  ); 