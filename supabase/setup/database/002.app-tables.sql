-- 
-- 
-- RSVPs
-- 
-- 


CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    meeting_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, meeting_id)
)

-- Create index for performance
CREATE INDEX idx_rsvps_user_id ON rsvps(user_id);

-- Enable RLS
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own rsvps
create policy "Users can read their own rsvps"
on "public"."rsvps"
for select
to authenticated
using (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rsvps"
  ON rsvps
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own rsvps"
  ON rsvps
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 
-- 
-- BOOKMARKS
-- 
-- 

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, resource_id)
)

-- Create index for performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);


-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own bookmarks
create policy "Users can read their own bookmarks"
on "public"."bookmarks"
for select
to authenticated
using (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 
-- 
-- SUBSCRIPTIONS
-- 
-- 


CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,  
  stripe_price_id TEXT NOT NULL,  
  amount NUMERIC(10,2) NOT NULL,  
  plan_id VARCHAR NOT NULL,
  "status" TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),

  card_last4 TEXT,
  card_type TEXT,

  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,

  trial_start TIMESTAMPTZ,   -- when the trial period began
  trial_end   TIMESTAMPTZ,   -- when the trial period ends

  canceled_at TIMESTAMPTZ,  -- user clicked cancel (immediate or end-of-period)
  cancel_at TIMESTAMPTZ, -- scheduled end-of-period cancellation

  failed_at TIMESTAMPTZ, -- first payment failure timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Create index for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- This index will reject any INSERT (or UPDATE that sets status to active or trialing) if there’s already one for that user_id.
CREATE UNIQUE INDEX unique_active_subscription_per_user
  ON subscriptions(user_id)
WHERE status IN ('active', 'trialing');


CREATE OR REPLACE VIEW active_subscriptions AS
SELECT *
FROM subscriptions
WHERE
  status IN ('active','trialing')
  OR (
    failed_at IS NOT NULL
    AND now() < failed_at + INTERVAL '14 days'
  );


ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions"
ON "public"."subscriptions"
FOR SELECT 
to authenticated
USING (user_id = auth.uid());


CREATE POLICY "Users can update their subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  