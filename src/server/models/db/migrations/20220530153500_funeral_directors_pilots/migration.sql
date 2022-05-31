-- Add Inda, Croatia, Nigeria, Colombia

INSERT INTO "Country" ("id", "createdAt", "updatedAt", "name") VALUES
    (DEFAULT, DEFAULT, now(), 'India'),
    (DEFAULT, DEFAULT, now(), 'Croatia'),
    (DEFAULT, DEFAULT, now(), 'Nigeria'),
    (DEFAULT, DEFAULT, now(), 'Colombia') ON CONFLICT DO NOTHING;

INSERT INTO "List" ("id", "reference", "createdAt", "updatedAt", "type", "countryId", "jsonData") VALUES
    (DEFAULT, gen_random_uuid(), DEFAULT, now(), 'funeralDirectors', (SELECT "id" from "Country" WHERE "Country"."name"='India'), '{"publishers":["tom.evans@fcdo.gov.uk"],"validators":["tom.evans@fcdo.gov.uk"],"administrators":["tom.evans@fcdo.gov.uk"]}'),
    (DEFAULT, gen_random_uuid(), DEFAULT, now(), 'funeralDirectors', (SELECT "id" from "Country" WHERE "Country"."name"='Croatia'), '{"publishers":["tom.evans@fcdo.gov.uk"],"validators":["tom.evans@fcdo.gov.uk"],"administrators":["tom.evans@fcdo.gov.uk"]}'),
    (DEFAULT, gen_random_uuid(), DEFAULT, now(), 'funeralDirectors', (SELECT "id" from "Country" WHERE "Country"."name"='Nigeria'), '{"publishers":["tom.evans@fcdo.gov.uk"],"validators":["tom.evans@fcdo.gov.uk"],"administrators":["tom.evans@fcdo.gov.uk"]}'),
    (DEFAULT, gen_random_uuid(), DEFAULT, now(), 'funeralDirectors', (SELECT "id" from "Country" WHERE "Country"."name"='Colombia'), '{"publishers":["tom.evans@fcdo.gov.uk"],"validators":["tom.evans@fcdo.gov.uk"],"administrators":["tom.evans@fcdo.gov.uk"]}') ON CONFLICT DO NOTHING;
