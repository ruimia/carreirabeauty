ALTER TABLE companies     ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS mp_subscription_id text;
