-- Update Czech Republic to Czechia
UPDATE
    "Country"
SET
    "name" = 'Czechia'
WHERE
    "name" = 'Czech Republic';
