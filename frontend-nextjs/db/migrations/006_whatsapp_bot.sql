CREATE TABLE IF NOT EXISTS oktae.whatsapp_conversations (
 waba_id text NOT NULL, sender_id text NOT NULL, profile_name text NOT NULL DEFAULT '',
 contact_id uuid REFERENCES oktae.contacts(id) ON DELETE SET NULL,
 last_customer_at timestamptz NOT NULL DEFAULT now(), paused_until timestamptz,
 pause_reason text NOT NULL DEFAULT '', PRIMARY KEY(waba_id,sender_id)
);
CREATE TABLE IF NOT EXISTS oktae.whatsapp_jobs (
 message_id text PRIMARY KEY, waba_id text NOT NULL, sender_id text NOT NULL,
 text_body text NOT NULL, received_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','answered','skipped','failed','send_uncertain')),
 attempts integer NOT NULL DEFAULT 0, lease_id uuid, lease_until timestamptz,
 response_message_id text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(waba_id,sender_id) REFERENCES oktae.whatsapp_conversations(waba_id,sender_id)
);
CREATE INDEX IF NOT EXISTS whatsapp_jobs_pending ON oktae.whatsapp_jobs(status,created_at);
CREATE INDEX IF NOT EXISTS whatsapp_jobs_conversation ON oktae.whatsapp_jobs(waba_id,sender_id,status);
