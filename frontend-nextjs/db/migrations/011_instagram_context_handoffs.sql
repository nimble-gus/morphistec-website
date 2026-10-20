ALTER TABLE oktae.messenger_handoffs ADD COLUMN IF NOT EXISTS social_account_id text;
ALTER TABLE oktae.messenger_handoffs ADD COLUMN IF NOT EXISTS social_sender_id text;
ALTER TABLE oktae.messenger_handoffs ALTER COLUMN contact_id DROP NOT NULL;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='handoff_requires_context_identity' AND conrelid='oktae.messenger_handoffs'::regclass) THEN
  ALTER TABLE oktae.messenger_handoffs ADD CONSTRAINT handoff_requires_context_identity CHECK(contact_id IS NOT NULL OR (source_channel='instagram' AND social_account_id IS NOT NULL AND social_sender_id IS NOT NULL));
 END IF;
END $$;
