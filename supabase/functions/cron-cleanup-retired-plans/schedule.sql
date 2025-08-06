-- 
-- NOTE: See setup-cron.md for instructions on how to store project_url and anon_key in Supabase Vault
-- 

-- Schedule the cron-cleanup-retired-plans function to run twice a day (midnight and noon)
select
  cron.schedule(
    'cron-cleanup-retired-plans',
    '0 0,12 * * *', -- At minute 0 past hour 0 and 12 (midnight and noon)
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/cron-cleanup-retired-plans',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
          ),
          body:=concat('{"time": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  ); 