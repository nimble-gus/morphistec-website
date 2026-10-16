ALTER TABLE oktae.users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
ALTER TABLE oktae.users ADD COLUMN IF NOT EXISTS credential_version integer NOT NULL DEFAULT 0;
ALTER TABLE oktae.sessions ADD COLUMN IF NOT EXISTS credential_version integer NOT NULL DEFAULT 0;
