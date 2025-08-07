-- Wrapper to expose drink_log.award_badges via public schema for PostgREST/Supabase RPC

CREATE OR REPLACE FUNCTION public.award_badges(p_from date, p_to date)
RETURNS TABLE(inserted_count int)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT * FROM drink_log.award_badges(p_from, p_to);
$$;

-- Allow authenticated clients to execute via RPC
GRANT EXECUTE ON FUNCTION public.award_badges(date, date) TO authenticated;


