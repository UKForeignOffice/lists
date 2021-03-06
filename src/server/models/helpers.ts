import { isNumber, isArray } from "lodash";
import { logger } from "server/services/logger";
import { getDbPool } from "./db/database";
import { LegalAreas } from "./types";

export const rawInsertGeoLocation = async (
  point: number[]
): Promise<number | boolean> => {
  try {
    if (!isNumber(point[0]) || !isNumber(point[0])) {
      // make sure these are number to avoid sql injection
      return false;
    }

    const db = getDbPool();
    const result = await db.query(`
      INSERT INTO public."GeoLocation" (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
    `);

    return result?.rows?.[0]?.id ?? false;
  } catch (error) {
    logger.error("Insert raw GeoLocation", error);
    return false;
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
