-- Add an admin-controlled announcement banner to site_settings. Seeded
-- disabled so the public site looks unchanged until an admin writes a message.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS announcement JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE site_settings
SET announcement = '{
  "enabled": false,
  "message": "",
  "tone": "info"
}'::jsonb
WHERE announcement = '{}'::jsonb OR announcement IS NULL;
