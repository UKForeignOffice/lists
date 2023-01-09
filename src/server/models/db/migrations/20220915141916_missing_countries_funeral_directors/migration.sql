-- Adds all remaining countries for funeralDirector service

INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData")

SELECT gen_random_uuid(), NOW(), 'funeralDirectors', missingCountries."id", '{"publishers": ["ali.salaman@fcdo.gov.uk","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"], "validators": ["ali.salaman@fcdo.gov.uk","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"], "administrators": ["ali.salaman@fcdo.gov.uk","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"]}'

FROM (SELECT "Country"."id" FROM (SELECT * from "List" WHERE "type" = 'funeralDirectors') as countryIdsForFuneralDirectors

FULL OUTER JOIN "Country" ON "Country".id = countryIdsForFuneralDirectors."countryId"

WHERE countryIdsForFuneralDirectors."countryId" is null) as missingCountries;
