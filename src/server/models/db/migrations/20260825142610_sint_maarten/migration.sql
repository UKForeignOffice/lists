-- Update St Maarten to Sint Maarten
UPDATE
  "Country"
SET
    "name" = 'Sint Maarten'
WHERE
  "name" = 'St Maarten';
