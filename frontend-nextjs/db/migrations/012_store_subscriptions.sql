ALTER TABLE oktae.payment_links
 ADD COLUMN IF NOT EXISTS charge_type text NOT NULL DEFAULT 'one_time' CHECK(charge_type IN ('one_time','recurring')),
 ADD COLUMN IF NOT EXISTS store_url text,
 ADD COLUMN IF NOT EXISTS subscription_id text UNIQUE,
 ADD COLUMN IF NOT EXISTS subscription_status text CHECK(subscription_status IN ('awaiting_authorization','active','past_due','paused','cancelled','expired')),
 ADD COLUMN IF NOT EXISTS next_billing_at timestamptz,
 ADD COLUMN IF NOT EXISTS next_payment_attempt_at timestamptz,
 ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS payment_store_subscription ON oktae.payment_links(contact_id,store_url,environment)
 WHERE charge_type='recurring' AND subscription_status NOT IN ('cancelled','expired');
CREATE TABLE IF NOT EXISTS oktae.subscription_charges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 payment_link_id uuid NOT NULL REFERENCES oktae.payment_links(id),
 provider_payment_id text NOT NULL UNIQUE,
 amount_in_cents integer NOT NULL CHECK(amount_in_cents>0),
 currency text NOT NULL CHECK(currency IN ('USD','GTQ')),
 paid_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscription_charge_link ON oktae.subscription_charges(payment_link_id,paid_at DESC);
