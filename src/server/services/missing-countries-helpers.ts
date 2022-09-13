import { countriesList } from "./metadata";
import { prisma } from "../models/db/prisma-client";
import { logger } from "../services/logger";

// select * from "Country";
const countreisData = [
  "Italy",
  "Portugal",
  "France",
  "United Kingdom",
  "Germany",
  "India",
  "Croatia",
  "Nigeria",
  "Colombia",
];

/**
 *
 * @ref npx ts-node src/server/services/missing-countries-helpers.ts
 * place result in add_missing_countries migration
 */
function getMissingCountries(
  countriesFromDB: string[],
  countriesFromMetadata: Array<{ text: string; value: string; code: string }>
): string[] {
  const dbMigration = [];

  const countryNames = countriesFromMetadata.map((country: { text: string }) => country.text);

  const filteredCountries = countryNames.filter((country: string) => !countriesFromDB.includes(country));

  for (const country of filteredCountries) {
    dbMigration.push(`(NOW(), '${country}')`);
  }

  return dbMigration;
}

// @ts-ignore
getMissingCountries(countreisData, countriesList);
// console.dir(getMissingCountries(countreisData, countriesList), {'maxArrayLength': null});

// ####################################

// select * from "List" where "type" = 'lawyers';

const countryIds = ["36", "34", "1", "2"];

/**
 *
 * @ref replicating this query: INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData") VALUES (gen_random_uuid(), NOW(), 'lawyers', 289, '{"publishers": ["ali@cautionyourblast.com","test@cautionyourblast.com"], "validators": ["ali@cautionyourblast.com","test@cautionyourblast.com"], "administrators": ["ali@cautionyourblast.com","test@cautionyourblast.com"]}');
 */
async function addMissingLists(existingCountryIds: string[], service: string, emails: string[]): Promise<string[]> {
  const dbMigration = [];
  // get ids for countries that do not exist for service, using prisma
  const allCountries = await prisma.country.findMany();

  const filteredCountries = allCountries.filter(
    (country: { id: number }) => !existingCountryIds.includes(country.id.toString())
  );

  for (const country of filteredCountries) {
    dbMigration.push(
      `(gen_random_uuid(), NOW(), '${service}', '${country.id}', '{"publishers": [${emails}], "validators": [${emails}], "administrators": [${emails}]}')`
    );
  }

  return dbMigration;
}

// @ts-ignore
// addMissingLists(countryIds, 'lawyers', ['ali@cautionyourblast.com']);

addMissingLists(countryIds, "lawyers", ["ali@cautionyourblast.com", "test@cautionyourblast.com"])
  .then((data) => {
    // console.dir(data, {'maxArrayLength': null});
    process.exit(1);
  })
  .catch((err) => logger.error(err));
