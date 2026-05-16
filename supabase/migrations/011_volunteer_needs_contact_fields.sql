-- Add contact_name and contact_phone columns to volunteer_needs.
-- Admins requested these so a volunteer posting can route through a
-- specific person, not only an email inbox.

ALTER TABLE volunteer_needs
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;
