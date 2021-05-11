import { upperFirst, isNumber, isArray } from "lodash";
import { logger } from "server/services/logger";
import { db } from "./db/database";
import { CountriesWithData, CountryName, LegalAreas } from "./types";

const countriesWithData: CountriesWithData[] = [
  "Thailand",
  "France",
  "Italy",
  "Spain",
];

export const countryHasLawyers = (countryName: CountryName): boolean => {
  return countriesWithData.includes(
    upperFirst(countryName) as CountriesWithData
  );
};

export const rawInsertGeoLocation = async (
  point: number[]
): Promise<number | boolean> => {
  try {
    if (!isNumber(point[0]) || !isNumber(point[0])) {
      // make sure these are number to avoid sql injection
      return false;
    }

    const result = await db.query(`
      INSERT INTO public."GeoLocation" (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
    `);

    return result?.rows?.[0]?.id ?? false;
  } catch (error) {
    logger.error("Insert raw GeoLocation", error);
    return false;
  }
};

export const listAppliedMigrations = async (): Promise<any> => {
  const query = "SELECT * from _prisma_migrations";

  try {
    const { rows } = await db.query(query);
    return { migrations: rows };
  } catch (error) {
    logger.error("listAppliedMigrations error:", error);
    return error;
  }
};

export function filterAllowedLegalAreas(legalAreas: string[]): LegalAreas[] {
  const allowed = [
    "bankruptcy",
    "corporate",
    "criminal",
    "employment",
    "family",
    "health",
    "immigration",
    "intellectual property",
    "international",
    "maritime",
    "personal injury",
    "real estate",
    "tax",
  ];

  return legalAreas.filter((legalArea) =>
    allowed.includes(legalArea.toLowerCase())
  ) as LegalAreas[];
}

export function geoPointIsValid(geoPoint: any): boolean {
  return isArray(geoPoint) && isNumber(geoPoint[0]) && isNumber(geoPoint[1]);
}
