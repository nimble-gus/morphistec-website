CREATE TABLE IF NOT EXISTS oktae.messenger_leads (
 page_id text NOT NULL,
 psid text NOT NULL,
 contact_id uuid NOT NULL UNIQUE REFERENCES oktae.contacts(id),
 name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '',
 interest text NOT NULL DEFAULT '', stage text NOT NULL DEFAULT 'new',
 last_contact_at timestamptz, observed_at timestamptz NOT NULL,
 PRIMARY KEY(page_id,psid)
);
CREATE INDEX IF NOT EXISTS messenger_last_contact ON oktae.messenger_leads(last_contact_at DESC);
