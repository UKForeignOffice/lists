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
  "Argentina",
  "Austria",
  "Bangladesh",
  "Barbados",
  "Bolivia",
  "Brazil",
  "Brunei",
  "Cambodia",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Nicaragua",
  "Cyprus",
  "Denmark",
  "Estonia",
  "Greece",
  "Grenada",
  "Guatemala",
  "Honduras",
  "El Salvador",
  "Japan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Malaysia",
  "Malta",
  "Mexico",
  "Belize",
  "Panama",
  "Burma",
  "Pakistan",
  "Peru",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Saint Lucia",
  "Saint Kitts and Nevis",
  "Saint Vincent and the Grenadines",
  "Sweden",
  "Switzerland",
  "Liechtenstein",
  "Thailand",
  "The Occupied Palestinian Territories",
  "Turkey",
  "Uruguay",
  "Venezuela",
  "Vietnam",
  "Trinidad and Tobago",
  "Guyana",
  "Suriname",
  "Jamaica",
  "Bahamas",
  "Finland",
  "Norway",
  "Dominican Republic",
  "Haiti",
  "Bahrain",
  "Uganda",
  "Antigua and Barbuda",
  "Cuba",
  "Dominica",
  "Iraq",
  "Kuwait",
  "Nepal",
  "Nigeria",
  "Oman",
  "Qatar",
  "United Arab Emirates",
  "Russia",
  "Kazakhstan",
  "Tajikistan",
  "Indonesia",
  "Slovakia",
  "Fiji",
  "Singapore",
  "Congo, Democratic Republic",
  "Bulgaria",
  "Macedonia",
  "Ghana",
  "Belgium",
  "Croatia",
  "Hong Kong",
  "Congo Democratic Republic",
  "Israel",
  "Luxembourg",
  "Zimbabwe",
  "Zambia",
  "Mozambique",
  "Namibia",
  "Angola",
  "Malawi",
  "Botswana",
  "Moldova",
  "South Africa",
  "Swaziland",
  "Lesotho",
  "Australia",
  "Seychelles",
  "Madagascar",
  "Netherlands",
  "Burkina Faso",
  "Togo",
  "Benin",
  "Gambia",
  "Sierra Leone",
  "Senegal",
  "Guinea-Bissau",
  "Mali",
  "Mauritania",
  "Liberia",
  "Guinea",
  "Hungary",
  "Mauritius",
  "India",
  "Eswatini",
  "Côte d'Ivoire",
  "Taiwan",
  "Czech Republic",
  "Iran",
  "San Marino",
  "northern Cyprus",
  "South Sudan",
  "Georgia",
  "Rwanda",
  "Morocco",
  "North Macedonia",
  "Northern Cyprus",
  "Azerbaijan",
  "Egypt",
  "Ethiopia",
  "Eritrea",
  "Djibouti",
  "Sudan",
  "Ukraine",
  "Poland",
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
// process.exit(1);

// ####################################

// select * from "List" where type = 'funeralDirectors';

const countryIds: string[] = ["139", "238", " 2", "32", "67"]; // translatorsInterpreters
// [" 67"," 69"," 68"," 70"," 71"," 72"," 73","  1"," 34"," 75"," 81"," 89"," 90"," 93"," 94"," 96","102","83","80","74","92","76","79","91","95","84","88","78","77","97","99","86","100","98","101","110","109","107","108","112","113","2","36","106","128","105","111","121","126","119","127","118","117","122","123","129","87","134","104","103","135","124","136","137","138","140","141","139","144","142","157","147","148","145","143","125","149","152","160","161","153","151","156","158","179","155","163","154","159","212","213","171","214","215","172","173"," 35","166","167","146","165","174","175","176","177","178","216","162","218","219"," 85","221","220","223","169","170","168","225","222","133","234","235","233","211","114","236","132",]; // lawyers
// ["148","132","207"," 76"," 35"," 67"," 68"," 69"," 70"," 71"," 75"," 77"," 72"," 74"," 78"," 79","218"," 80"," 81"," 36"," 82"," 84"," 85"," 86","100"," 87"," 83"," 89"," 90"," 91"," 93"," 94"," 95"," 96"," 97"," 98"," 99"," 92","101","102","103","104","105","106","107","108","110","111","112","113","115","116","117","118","119","120","121","122","123","126","127","130","131","133","134","135","144","154","156","157","159","160","128","129","146","147","223","152","220","153","155","158","161","165","225","163","167","172","173","176","177","179","211","168","170","171","174","178","212","213","214","215","216","219","221","222","233","235","  2","234"," 73"," 88","114","237","151","125","109",]// funeralDirectors
//

/**
 *
 * @ref replicating this query: INSERT INTO "List" ("reference", "updatedAt", type, "countryId", "jsonData") VALUES (gen_random_uuid(), NOW(), 'lawyers', 289, '{"publishers": ["ali@cautionyourblast.com","test@cautionyourblast.com"], "validators": ["ali@cautionyourblast.com","test@cautionyourblast.com"], "administrators": ["ali@cautionyourblast.com","test@cautionyourblast.com"]}');
 */
async function addMissingLists(existingCountryIds: string[], service: string, emails: string[]): Promise<string[]> {
  const dbMigration = [];
  // get ids for countries that do not exist for service, using prisma
  const allCountries = await prisma.country.findMany();

  const cleanedCountryIds = existingCountryIds.map((countryid) => countryid.trim());
  const filteredCountries = allCountries.filter(
    (country: { id: number }) => !cleanedCountryIds.includes(country.id.toString())
  );

  for (const country of filteredCountries) {
    dbMigration.push(
      `(gen_random_uuid(), NOW(), '${service}', '${country.id}', '{"publishers": [${emails}], "validators": [${emails}], "administrators": [${emails}]}')`
    );
  }

  return dbMigration;
}

// @ts-ignore

addMissingLists(countryIds, "translatorsInterpreters", ["ali@cautionyourblast.com", "tom.evans@fcdo.gov.uk"])
  .then((data) => {
    // console.dir(data, {'maxArrayLength': null});
    process.exit(1);
  })
  .catch((err) => logger.error(err));
