-- Adds all remaining countries for translator interpretors

INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData")

SELECT gen_random_uuid(), NOW(), 'translatorsInterpreters', missingCountries."id", '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk","rosalyn.vaughan@fcdo.gov.uk"]}'

FROM (SELECT "Country"."id" FROM (SELECT * from "List" WHERE "type" = 'translatorsInterpreters') as countryIdsForTranslators

FULL OUTER JOIN "Country" ON "Country".id = countryIdsForTranslators."countryId"

WHERE countryIdsForTranslators."countryId" is null) as missingCountries;
