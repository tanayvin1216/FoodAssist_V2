-- Add admin-editable category catalog (assistance types + donation types)
-- to the single-row site_settings table. Seeds the existing in-code defaults
-- so behavior is unchanged until an admin edits them.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE site_settings
SET categories = '{
  "assistanceTypes": [
    {"slug": "collection", "label": "Food Collection Site", "isActive": true, "order": 0},
    {"slug": "hot_meals_eat_in", "label": "Hot Meals (Eat In)", "isActive": true, "order": 1},
    {"slug": "hot_meals_pickup", "label": "Hot Meals (Pickup)", "isActive": true, "order": 2},
    {"slug": "hot_meals_delivery", "label": "Hot Meals (Delivery)", "isActive": true, "order": 3},
    {"slug": "staffed_pantry", "label": "Staffed Food Pantry", "isActive": true, "order": 4},
    {"slug": "self_serve_pantry", "label": "Self-Serve Pantry", "isActive": true, "order": 5}
  ],
  "donationTypes": [
    {"slug": "non_perishables", "label": "Non-Perishables", "isActive": true, "order": 0},
    {"slug": "frozen_meals_or_meats", "label": "Frozen Meals/Meats", "isActive": true, "order": 1},
    {"slug": "fresh_produce", "label": "Fresh Produce", "isActive": true, "order": 2},
    {"slug": "prepared_meals", "label": "Prepared Meals", "isActive": true, "order": 3},
    {"slug": "hygiene_or_housecleaning", "label": "Hygiene/Housecleaning", "isActive": true, "order": 4},
    {"slug": "kitchen_household_items", "label": "Kitchen/Household Items", "isActive": true, "order": 5},
    {"slug": "clothing_or_shoes", "label": "Clothing/Shoes", "isActive": true, "order": 6}
  ]
}'::jsonb
WHERE categories = '{}'::jsonb OR categories IS NULL;
