-- Segregate food-insecurity orgs from other-sector orgs that share the
-- organizations table with the sister app (carteret-assist-hub).
--
-- FoodAssist filters every read and write to sector = 'food_insecurity'.
-- The sister app can either show everything (current behavior) or filter
-- to its own sector(s) as it sees fit.

ALTER TABLE organizations
  ADD COLUMN sector TEXT NOT NULL DEFAULT 'other';

-- Backfill the original 36 FoodAssist rows: any row whose assistance_types
-- contains a food-specific value is one of ours. Rows imported by the sister
-- app have empty assistance_types or non-food values and stay as 'other'.
UPDATE organizations
SET sector = 'food_insecurity'
WHERE assistance_types && ARRAY[
  'collection',
  'hot_meals_pickup',
  'hot_meals_delivery',
  'staffed_pantry',
  'self_serve_pantry'
]::TEXT[];

CREATE INDEX idx_organizations_sector ON organizations(sector);
