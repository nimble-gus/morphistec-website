-- Private WhatsApp setup. No token is stored in plaintext.
CREATE TABLE IF NOT EXISTS oktae.whatsapp_setup (
 id integer PRIMARY KEY CHECK(id=1), webhook_verified_at timestamptz
);
INSERT INTO oktae.whatsapp_setup(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS oktae.whatsapp_onboarding_attempts (
 nonce_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES oktae.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 consumed_at timestamptz
);
CREATE INDEX IF NOT EXISTS whatsapp_attempts_user_created ON oktae.whatsapp_onboarding_attempts(user_id,created_at);
CREATE TABLE IF NOT EXISTS oktae.whatsapp_connections (
 id integer PRIMARY KEY CHECK(id=1), waba_id text NOT NULL, phone_number_id text NOT NULL,
 display_phone_number text NOT NULL, token_encrypted text NOT NULL, token_expires_at timestamptz NOT NULL,
 status text NOT NULL CHECK(status IN ('linked_bot_paused','subscription_pending')),
 connected_by uuid NOT NULL REFERENCES oktae.users(id), connected_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.whatsapp_events (
 event_key text PRIMARY KEY, waba_id text NOT NULL, field text NOT NULL,
 payload jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz
);
CREATE INDEX IF NOT EXISTS whatsapp_events_pending ON oktae.whatsapp_events(received_at) WHERE processed_at IS NULL;
