CREATE SCHEMA IF NOT EXISTS oktae;
CREATE TABLE IF NOT EXISTS oktae.users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE,
 password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES oktae.users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON oktae.sessions(expires_at);
CREATE TABLE IF NOT EXISTS oktae.login_attempts (
 identity_hash text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, reset_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS oktae.contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, company text NOT NULL DEFAULT '',
 email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
 stage text NOT NULL DEFAULT 'nuevo' CHECK(stage IN ('nuevo','contactado','demo','propuesta','ganado','perdido')),
 source text NOT NULL DEFAULT 'manual', next_follow_up date,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.notes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contact_id uuid NOT NULL REFERENCES oktae.contacts(id),
 body text NOT NULL, created_by uuid NOT NULL REFERENCES oktae.users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.payment_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contact_id uuid NOT NULL REFERENCES oktae.contacts(id),
 concept text NOT NULL, amount_in_cents integer NOT NULL CHECK(amount_in_cents>0),
 currency text NOT NULL CHECK(currency IN ('GTQ','USD')), status text NOT NULL DEFAULT 'creating'
 CHECK(status IN ('creating','pending','paid','failed','review')),
 request_key uuid NOT NULL UNIQUE, checkout_id text UNIQUE, checkout_url text,
 environment text NOT NULL CHECK(environment IN ('test','live')),
 created_by uuid NOT NULL REFERENCES oktae.users(id), created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS payment_contact ON oktae.payment_links(contact_id);
CREATE TABLE IF NOT EXISTS oktae.webhook_events (
 event_id text PRIMARY KEY, event_type text NOT NULL, processed_at timestamptz NOT NULL DEFAULT now()
);
