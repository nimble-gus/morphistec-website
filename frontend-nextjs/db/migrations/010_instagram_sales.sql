CREATE TABLE IF NOT EXISTS oktae.instagram_leads (
 account_id text NOT NULL, sender_id text NOT NULL, contact_id uuid UNIQUE REFERENCES oktae.contacts(id),
 name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '',
 interest text NOT NULL DEFAULT '', stage text NOT NULL DEFAULT 'new', observed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(account_id,sender_id)
);
ALTER TABLE oktae.conversation_messages DROP CONSTRAINT IF EXISTS conversation_messages_channel_check;
ALTER TABLE oktae.conversation_messages ADD CONSTRAINT conversation_messages_channel_check CHECK(channel IN ('messenger','instagram','whatsapp'));
ALTER TABLE oktae.conversation_messages ADD COLUMN IF NOT EXISTS social_account_id text;
ALTER TABLE oktae.conversation_messages ADD COLUMN IF NOT EXISTS social_sender_id text;
CREATE INDEX IF NOT EXISTS conversation_social ON oktae.conversation_messages(channel,social_account_id,social_sender_id,created_at);
ALTER TABLE oktae.messenger_handoffs ADD COLUMN IF NOT EXISTS source_channel text NOT NULL DEFAULT 'messenger' CHECK(source_channel IN ('messenger','instagram'));
