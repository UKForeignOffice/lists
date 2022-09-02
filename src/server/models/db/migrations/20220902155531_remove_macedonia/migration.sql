-- Delete items from the List table with the Macedonia country id
DELETE FROM "List" WHERE "countryId" = (SELECT id FROM "Country" WHERE "name" = 'Macedonia');

-- Delete Macedonia from the Country table
DELETE FROM "Country" WHERE "name" = 'Macedonia';