-- Extend the admin-editable category catalog with the towns list that
-- powers the organization edit form. Existing rows get the same Carteret
-- County town list previously hardcoded in `lib/utils/constants.ts`.

UPDATE site_settings
SET categories = categories || jsonb_build_object(
  'towns',
  '["Atlantic","Atlantic Beach","Beaufort","Bettie","Cedar Island","Davis","Emerald Isle","Gloucester","Harkers Island","Havelock","Indian Beach","Marshallberg","Morehead City","Newport","Ocean","Otway","Peletier","Pine Knoll Shores","Salter Path","Sea Level","Smyrna","Stacy","Stella","Straits","Swansboro","Williston"]'::jsonb
)
WHERE NOT (categories ? 'towns');
