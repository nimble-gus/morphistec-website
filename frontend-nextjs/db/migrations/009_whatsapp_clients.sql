-- Managed by Oktae staff. Client conversations never become Oktae sales contacts.
CREATE TABLE IF NOT EXISTS oktae.wa_clients (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, contact_name text NOT NULL DEFAULT '',
 email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', responsible text NOT NULL DEFAULT '',
 plan text NOT NULL DEFAULT '', monthly_cents integer NOT NULL DEFAULT 0 CHECK(monthly_cents>=0),
 monthly_limit integer NOT NULL DEFAULT 1000 CHECK(monthly_limit BETWEEN 1 AND 1000000),
 instructions text NOT NULL DEFAULT '', knowledge text NOT NULL DEFAULT '', hours text NOT NULL DEFAULT '',
 tone text NOT NULL DEFAULT 'Cercano y profesional', timezone text NOT NULL DEFAULT 'America/Guatemala',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','configuration','testing','active','paused')),
 config_version integer NOT NULL DEFAULT 1, tested_version integer, tested_at timestamptz,
 created_by uuid NOT NULL REFERENCES oktae.users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.wa_client_connections (
 client_id uuid PRIMARY KEY REFERENCES oktae.wa_clients(id), waba_id text NOT NULL UNIQUE,
 phone_number_id text NOT NULL UNIQUE, display_phone_number text NOT NULL,
 token_encrypted text NOT NULL, token_expires_at timestamptz NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','connected','disconnected')), connected_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.wa_client_invites (
 token_hash text PRIMARY KEY, client_id uuid NOT NULL REFERENCES oktae.wa_clients(id),
 nonce_hash text, expires_at timestamptz NOT NULL, consumed_at timestamptz, revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.wa_client_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES oktae.wa_clients(id),
 sender_id text NOT NULL, profile_name text NOT NULL DEFAULT '', last_customer_at timestamptz NOT NULL,
 paused_until timestamptz, pause_reason text, qualified boolean NOT NULL DEFAULT false,
 interest text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '', UNIQUE(client_id,sender_id), UNIQUE(client_id,id)
);
CREATE TABLE IF NOT EXISTS oktae.wa_client_messages (
 client_id uuid NOT NULL REFERENCES oktae.wa_clients(id), message_id text NOT NULL,
 conversation_id uuid NOT NULL, direction text NOT NULL CHECK(direction IN ('customer','assistant','human')),
 body text NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','answered','skipped','failed','send_uncertain','recorded')),
 attempts integer NOT NULL DEFAULT 0, quota_month date, quota_held boolean NOT NULL DEFAULT false, lease uuid, lease_until timestamptz, updated_at timestamptz NOT NULL DEFAULT now(),
 receipt text, PRIMARY KEY(client_id,message_id),
 FOREIGN KEY(client_id,conversation_id) REFERENCES oktae.wa_client_conversations(client_id,id)
);
CREATE INDEX IF NOT EXISTS wa_client_messages_queue ON oktae.wa_client_messages(status,updated_at);
CREATE TABLE IF NOT EXISTS oktae.wa_client_usage (
 client_id uuid NOT NULL REFERENCES oktae.wa_clients(id), month date NOT NULL, reserved integer NOT NULL DEFAULT 0,
 sent integer NOT NULL DEFAULT 0, tests integer NOT NULL DEFAULT 0, PRIMARY KEY(client_id,month)
);
CREATE TABLE IF NOT EXISTS oktae.wa_client_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, client_id uuid NOT NULL REFERENCES oktae.wa_clients(id),
 user_id uuid REFERENCES oktae.users(id), action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
