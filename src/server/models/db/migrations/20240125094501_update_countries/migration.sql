-- UPDATE Micronesia
UPDATE "Country"
SET name = 'Federated States of Micronesia'
WHERE name = 'Micronesia';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"Federated States of Micronesia"'),
  '{regions}',
  '"Federated States of Micronesia"'
)
WHERE "jsonData" ->> 'country' = 'Micronesia';

-- UPDATE Saint Kitts and Nevis
UPDATE "Country"
SET name = 'St Kitts and Nevis'
WHERE name = 'Saint Kitts and Nevis';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"St Kitts and Nevis"'),
  '{regions}',
  '"St Kitts and Nevis"'
)
WHERE "jsonData" ->> 'country' = 'Saint Kitts and Nevis';

-- UPDATE Saint Lucia
UPDATE "Country"
SET name = 'St Lucia'
WHERE name = 'Saint Lucia';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"St Lucia"'),
  '{regions}',
  '"St Lucia"'
)
WHERE "jsonData" ->> 'country' = 'Saint Lucia';

-- UPDATE Saint Vincent and the Grenadines
UPDATE "Country"
SET name = 'St Vincent'
WHERE name = 'Saint Vincent and the Grenadines';

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"St Vincent"'),
  '{regions}',
  '"St Vincent"')
WHERE "jsonData" ->> 'country' = 'Saint Vincent and the Grenadines';
