import { upperFirst, isNumber } from "lodash";
import { logger } from "services/logger";
import { db } from "./database";

const countriesWithData = ["Thailand"];

export const countryHasLawyers = (countryName: string): boolean => {
  return countriesWithData.includes(upperFirst(countryName));
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
      INSERT INTO public.geo_location (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
    `);
    
    return result?.rows?.[0]?.id ?? false;
  } catch (error) {
    logger.error("Insert raw GeoLocation", error);
    return false;
  }
};

export const createGeoLocationTable = async (): Promise<"OK" | string> => {
  const createPostGisExtension = "CREATE EXTENSION postgis;";

  const createGeoTable = `
     CREATE TABLE "geo_location" (
        "id" SERIAL NOT NULL,
        "location" geography(POINT),
        PRIMARY KEY ("id")
     );
  `;

  const results: string[] = [];

  try {
    await db.query(createGeoTable);
    results.push("postgis extension OK");
  } catch (error) {
    logger.error("Create postgis extension error:", error);
    results.push(error.message);
  }

  try {
    await db.query(createPostGisExtension);
    results.push("geo_location table OK");
  } catch (error) {
    logger.error("CreateGeoLocationTable error:", error);
    results.push(error.message);
  }

  return results.join(", ");
};
