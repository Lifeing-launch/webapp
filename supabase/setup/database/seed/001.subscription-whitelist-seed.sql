-- Seed script for subscription whitelist records
-- Description: Insert sample whitelist records with different cutoff date intervals for testing

-- Clear existing seed data (if any)
DELETE FROM subscription_whitelist WHERE email LIKE '%@example.com';

-- Insert whitelist records with different cutoff scenarios

-- No cutoff date (permanent access)
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('permanent@example.com', NULL),
('lifetime@example.com', NULL),
('vip@example.com', NULL);

-- Cutoff in 30 days
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('trial-30@example.com', NOW() + INTERVAL '30 days'),
('monthly@example.com', NOW() + INTERVAL '30 days'),
('short-term@example.com', NOW() + INTERVAL '30 days');

-- Cutoff in 365 days (1 year)
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('annual@example.com', NOW() + INTERVAL '365 days'),
('yearly@example.com', NOW() + INTERVAL '365 days'),
('long-term@example.com', NOW() + INTERVAL '365 days');

-- Cutoff in 730 days (2 years)
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('biennial@example.com', NOW() + INTERVAL '730 days'),
('two-year@example.com', NOW() + INTERVAL '730 days'),
('extended@example.com', NOW() + INTERVAL '730 days');

-- Expired cutoffs (for testing expired access)
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('expired@example.com', NOW() - INTERVAL '1 day'),
('past-due@example.com', NOW() - INTERVAL '7 days'),
('old-trial@example.com', NOW() - INTERVAL '30 days');

-- Very short term (for testing immediate expiration)
INSERT INTO subscription_whitelist (email, cutoff_datetime) VALUES
('hourly@example.com', NOW() + INTERVAL '1 hour'),
('daily@example.com', NOW() + INTERVAL '1 day'),
('weekly@example.com', NOW() + INTERVAL '7 days');


-- Verify the seed data
SELECT 
    email,
    cutoff_datetime,
    CASE 
        WHEN cutoff_datetime IS NULL THEN 'Permanent'
        WHEN cutoff_datetime < NOW() THEN 'Expired'
        ELSE 'Active'
    END as status,
    CASE 
        WHEN cutoff_datetime IS NULL THEN NULL
        WHEN cutoff_datetime < NOW() THEN NULL
        ELSE cutoff_datetime - NOW()
    END as time_remaining
FROM subscription_whitelist 
ORDER BY 
    CASE WHEN cutoff_datetime IS NULL THEN 1 ELSE 0 END,
    cutoff_datetime; 