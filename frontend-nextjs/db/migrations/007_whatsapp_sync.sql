ALTER TABLE oktae.whatsapp_connections DROP CONSTRAINT IF EXISTS whatsapp_connections_status_check;
ALTER TABLE oktae.whatsapp_connections ADD CONSTRAINT whatsapp_connections_status_check CHECK(status IN ('linked_bot_paused','subscription_pending','sync_pending','sync_review','disconnected'));
CREATE TABLE IF NOT EXISTS oktae.whatsapp_sync_requests (
 phone_number_id text NOT NULL,
 sync_type text NOT NULL CHECK(sync_type IN ('smb_app_state_sync','history')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','rejected','uncertain')),
 request_id text, consent_by uuid NOT NULL REFERENCES oktae.users(id),
 consent_at timestamptz NOT NULL DEFAULT now(), attempted_at timestamptz,
 PRIMARY KEY(phone_number_id,sync_type)
);
