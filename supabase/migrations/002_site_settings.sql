-- Site settings table (single-row, JSONB columns for each settings group)
-- This table stores all admin-configurable site settings

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding JSONB NOT NULL DEFAULT '{}',
  contact JSONB NOT NULL DEFAULT '{}',
  hero JSONB NOT NULL DEFAULT '{}',
  emergency JSONB NOT NULL DEFAULT '{}',
  navigation JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- RLS: everyone can read settings, only admins can modify
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage settings"
  ON site_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Ensure only one row ever exists
CREATE UNIQUE INDEX single_settings_row ON site_settings ((true));

-- Auto-update timestamp
CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();

-- Seed with default settings
INSERT INTO site_settings (branding, contact, hero, emergency, navigation, metadata)
VALUES (
  '{
    "siteName": "FoodAssist",
    "siteTagline": "Carteret County Food Assistance Directory",
    "logoAbbreviation": "FA",
    "primaryColor": "sky",
    "footerTagline": "Connecting Carteret County residents with local food assistance resources."
  }'::jsonb,
  '{
    "organizationName": "Carteret County Food & Health Council",
    "address": "P.O. Box 1234",
    "city": "Beaufort",
    "state": "NC",
    "email": "info@carteretfoodasist.org",
    "phone": "(252) 555-0100",
    "emergencyPhone": "(252) 555-0911",
    "emergencyPhoneDisplay": "(252) 555-0911",
    "externalHelpUrl": "https://www.211.org",
    "externalHelpLabel": "211.org"
  }'::jsonb,
  '{
    "locationBadge": "Carteret County, NC",
    "headline": "Find Food Assistance Near You",
    "subtitle": "Connect with local food pantries, hot meals, and community programs in your area.",
    "showStats": true,
    "statsLabels": {
      "locations": "Locations",
      "towns": "Towns Served",
      "services": "Service Types"
    }
  }'::jsonb,
  '{
    "enabled": true,
    "icon": "heart",
    "title": "Need Immediate Help?",
    "description": "If you or someone you know needs food assistance right now, help is available.",
    "showPrimaryPhone": true,
    "showExternalHelp": true
  }'::jsonb,
  '{
    "headerItems": [
      {"id": "home", "name": "Home", "href": "/", "enabled": true, "order": 1, "showInHeader": true, "showInFooter": true},
      {"id": "volunteers", "name": "Volunteers", "href": "/volunteers", "enabled": true, "order": 2, "showInHeader": true, "showInFooter": true}
    ],
    "footerQuickLinks": [
      {"id": "home", "name": "Home", "href": "/", "enabled": true, "order": 1, "showInHeader": true, "showInFooter": true},
      {"id": "volunteers", "name": "Volunteers", "href": "/volunteers", "enabled": true, "order": 2, "showInHeader": true, "showInFooter": true}
    ],
    "showSignIn": true,
    "signInLabel": "Sign In"
  }'::jsonb,
  '{
    "title": "FoodAssist - Carteret County Food Assistance Directory",
    "description": "Find food pantries, hot meals, and assistance programs in Carteret County, NC.",
    "keywords": ["food assistance", "food pantry", "Carteret County", "NC", "food bank"]
  }'::jsonb
);
