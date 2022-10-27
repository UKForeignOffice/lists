-- Adds all remaining countries for funeralDirector service

INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData")

SELECT gen_random_uuid(), NOW(), 'funeralDirectors', missingCountries."id", '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'

FROM (SELECT "Country"."id" FROM (SELECT * from "List" WHERE "type" = 'funeralDirectors') as countryIdsForFuneralDirectors

FULL OUTER JOIN "Country" ON "Country".id = countryIdsForFuneralDirectors."countryId"

WHERE countryIdsForFuneralDirectors."countryId" is null) as missingCountries;
