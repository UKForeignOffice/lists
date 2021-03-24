import { PrismaClient } from "@prisma/client";
import { upperFirst } from "lodash";
import { logger } from "services/logger";
import { db } from "./database";

const countriesWithData = ["Thailand"];

export const countryHasLawyers = (countryName: string): boolean => {
  return countriesWithData.includes(upperFirst(countryName));
};

export const rawInsertGeoLocation = async (
  point: number[],
): Promise<number | boolean> => {
  try {
    const result = await db.query(`
      INSERT INTO public.geo_location (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
    `);
    return result?.rows?.[0]?.id ?? false;
  } catch (error) {
    logger.error("Insert raw GeoLocation", error);
    return false;
  }
};

export const createGeoLocationTable = async (): Promise<"OK" | "ERROR"> => {
  const createPostGisExtension = "CREATE EXTENSION postgis;";

  const createGeoTable = `
     CREATE TABLE "geo_location" (
        "id" SERIAL NOT NULL,
        "location" geography(POINT),
        PRIMARY KEY ("id")
     );
  `;

  try {
    await db.query(createPostGisExtension);
    await db.query(createGeoTable);
    return "OK";
  } catch (error) {
    logger.error("CreateGeoLocationTable error:", error);
    return "ERROR";
  }
};
