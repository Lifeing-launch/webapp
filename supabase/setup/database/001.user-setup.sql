-- Create user_profile table. An estimate
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT
);


-- Define function to populate user_profile table using auth.user table
-- Name: fn_update_user_profile_on_auth_users_change
-- Return type: trigger
-- Type of Security: Security Definer

BEGIN
    -- If a new user is inserted, create a profile
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.user_profiles (id, email, first_name, last_name)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'email',
            NEW.raw_user_meta_data ->> 'firstName',
            NEW.raw_user_meta_data ->> 'lastName',
            NEW.raw_user_meta_data ->> 'avatarUrl'
        );
    
    -- If user data is updated, update the profile
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.user_profiles
        SET
            email = NEW.raw_user_meta_data ->> 'email',
            first_name = NEW.raw_user_meta_data ->> 'firstName',
            last_name = NEW.raw_user_meta_data ->> 'lastName',
            avatar_url = NEW.raw_user_meta_data ->> 'avatarUrl'
        WHERE id = NEW.id;
    
    -- If user is deleted, delete the profile
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.user_profiles
        WHERE id = OLD.id;
    END IF;

    RETURN NULL; -- for AFTER triggers, returning NULL is fine
END;


-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Row Level Security for user_profiles
create policy "Enable select for authenticated users only"
on "public"."user_profiles"
to authenticated
using (
  (( SELECT auth.uid() AS uid) = id)
);

CREATE POLICY "Enable update for authenticated users only"
on "public"."user_profiles"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- Trigger to update user_profiles table
CREATE TRIGGER trg_update_user_profile_on_auth_users_change
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION fn_update_user_profile_on_auth_users_change();