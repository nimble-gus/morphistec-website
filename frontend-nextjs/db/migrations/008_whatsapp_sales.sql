ALTER TABLE oktae.whatsapp_conversations ADD COLUMN IF NOT EXISTS handoff_code uuid;
CREATE TABLE IF NOT EXISTS oktae.messenger_handoffs (
 code uuid PRIMARY KEY DEFAULT gen_random_uuid(), contact_id uuid NOT NULL REFERENCES oktae.contacts(id),
 source_message_id text NOT NULL UNIQUE, expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
 claimed_waba text, claimed_sender text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS oktae.conversation_messages (
 id text PRIMARY KEY, contact_id uuid REFERENCES oktae.contacts(id),
 waba_id text, sender_id text, channel text NOT NULL CHECK(channel IN ('messenger','whatsapp')),
 direction text NOT NULL CHECK(direction IN ('customer','assistant','human')),
 body text NOT NULL, delivery text NOT NULL DEFAULT 'received' CHECK(delivery IN ('received','prepared','accepted')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversation_contact ON oktae.conversation_messages(contact_id,created_at);
CREATE INDEX IF NOT EXISTS conversation_whatsapp ON oktae.conversation_messages(waba_id,sender_id);
CREATE TABLE IF NOT EXISTS oktae.demo_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contact_id uuid NOT NULL REFERENCES oktae.contacts(id),
 source_message_id text NOT NULL UNIQUE, preferred_time text NOT NULL,
 timezone text NOT NULL DEFAULT 'America/Guatemala', duration_minutes integer NOT NULL DEFAULT 15 CHECK(duration_minutes=15),
 status text NOT NULL DEFAULT 'pending_confirmation' CHECK(status IN ('pending_confirmation','confirmed','completed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now()
);
