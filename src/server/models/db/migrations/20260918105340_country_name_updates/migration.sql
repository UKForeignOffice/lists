-- Keep stakeholder country names consistent with the selectable metadata.

UPDATE "Country"
SET "name" = 'The Bahamas'
WHERE "name" = 'Bahamas';

UPDATE "Country"
SET "name" = 'Bonaire, Sint Eustatius and Saba'
WHERE "name" = 'Bonaire,  Sint Eustatius and Saba';

-- Update legacy country values in ListItem jsonData without changing unrelated fields.
UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"Naoero"'),
  '{regions}',
  '"Naoero"'
)
WHERE "jsonData" ->> 'country' = 'Nauru';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"Sint Maarten"'),
  '{regions}',
  '"Sint Maarten"'
)
WHERE "jsonData" ->> 'country' = 'St Maarten';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"The Bahamas"'),
  '{regions}',
  '"The Bahamas"'
)
WHERE "jsonData" ->> 'country' = 'Bahamas';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"Bonaire, Sint Eustatius and Saba"'),
  '{regions}',
  '"Bonaire, Sint Eustatius and Saba"'
)
WHERE "jsonData" ->> 'country' = 'Bonaire,  Sint Eustatius and Saba';
