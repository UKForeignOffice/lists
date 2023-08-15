-- Update name of Gambia to The Gambia
-- In Country table

UPDATE "Country"
SET name = 'The Gambia'
WHERE name = 'Gambia';

-- In jsonData in ListItem table

UPDATE "ListItem"
SET "jsonData" = jsonb_set(
  jsonb_set("jsonData", '{country}', '"The Gambia"'),
  '{regions}',
  '"The Gambia"'
)
WHERE "jsonData" ->> 'country' = 'Gambia';
