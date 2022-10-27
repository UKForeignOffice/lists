-- Adds all remaining countries for lawyers service

INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData")

-- Add these values to the columns stated above

SELECT gen_random_uuid(), NOW(), 'lawyers', missingCountries."id", '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'

-- Get all the country ids for exiting lawyers in the Lists table

FROM (SELECT "Country"."id" FROM (SELECT * from "List" WHERE "type" = 'lawyers') as countryIdsForLawyers

-- Merge  above data to country table only for data that exists for the relevant country id.
-- Remaining Country rows will have 'null' values

FULL OUTER JOIN "Country" ON "Country".id = countryIdsForLawyers."countryId"

-- Get all the null rows from the list above and put them in 'missingCountries'

WHERE countryIdsForLawyers."countryId" is null) as missingCountries;