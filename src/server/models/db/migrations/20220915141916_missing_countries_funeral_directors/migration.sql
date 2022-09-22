-- Adds all remaining countries for funeralDirector service

INSERT INTO
    "List" ("reference", "updatedAt", type, "countryId", "jsonData")
VALUES
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Italy'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'France'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Bahrain'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Russia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Kazakhstan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tajikistan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Indonesia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Slovakia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Fiji'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Singapore'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Congo, Democratic Republic'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Hong Kong'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Congo Democratic Republic'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Swaziland'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Australia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Madagascar'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Togo'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Mali'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Mauritius'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Northern Cyprus'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Egypt'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Sudan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Poland'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Afghanistan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Albania'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Algeria'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'American Samoa'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Andorra'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Anguilla'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Armenia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Aruba'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Belarus'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Bermuda'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Bhutan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Bonaire, Sint Eustatius and Saba'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Bosnia and Herzegovina'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'British Indian Ocean Territory'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'British Virgin Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Burundi'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Cameroon'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Canada'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Cape Verde'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Cayman Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Central African Republic'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Chad'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'China'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Comoros'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Congo'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Cook Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Curaçao'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Ecuador'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Equatorial Guinea'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Falkland Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'French Guiana'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'French Polynesia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Gabon'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Gibraltar'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Guadeloupe'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Iceland'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Ireland'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Jordan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Kenya'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Kiribati'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Kosovo'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Kyrgyzstan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Libya'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Macao'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Maldives'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Marshall Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Martinique'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Mayotte'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Micronesia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Monaco'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Mongolia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Montenegro'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Montserrat'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Nauru'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'New Caledonia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'New Zealand'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Niger'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Niue'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'North Korea'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Palau'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Papua New Guinea'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Paraguay'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Philippines'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Pitcairn Island'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Réunion'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Romania'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Saint Barthélemy'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Saint Helena, Ascension and Tristan da Cunha'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Samoa'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'São Tomé and Príncipe'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Saudi Arabia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Serbia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Slovenia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Solomon Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Somalia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'South Georgia and South Sandwich Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'St Maarten'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'St Martin'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'St. Pierre and Miquelon'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Syria'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tanzania'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Timor-Leste'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tokelau'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tonga'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tunisia'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Turkmenistan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Turks and Caicos Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Tuvalu'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'United States'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Uzbekistan'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Vanuatu'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Wallis and Futuna Islands'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Western Sahara'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}'),
  (gen_random_uuid(), NOW(), 'funeralDirectors', (select "id" from "Country" where "name" = 'Yemen'), '{"publishers": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "validators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"], "administrators": ["ali@cautionyourblast.com","tom.evans@fcdo.gov.uk"]}');
