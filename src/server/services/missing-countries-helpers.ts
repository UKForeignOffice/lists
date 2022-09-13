import { countriesList } from "./metadata";

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
): string[] | undefined {
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
