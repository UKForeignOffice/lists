import { prisma } from "./prisma-client";
import { getDbPool } from "./database";
import { logger } from "server/services/logger";
import { seedDb } from "./seed-data/seed-db";

export const createPostgis = async (): Promise<string> => {
  const createPostGisExtension = "CREATE EXTENSION postgis;";

  try {
    const db = getDbPool();
    await db.query(createPostGisExtension);
    return "postgis extension OK";
  } catch (error) {
    logger.error("createPostgis extension error:", error);
    return error;
  }
};

export const createGeoLocationTable = async (): Promise<"OK" | string> => {
  const createGeoTable = `
     CREATE TABLE public."GeoLocation" (
        "id" SERIAL NOT NULL,
        "location" geography(POINT),
        PRIMARY KEY ("id")
     );
     CREATE INDEX location_geo_idx
     ON "GeoLocation"
     USING GIST (location);
  `;

  try {
    const db = getDbPool();
    await db.query(createGeoTable);
    return "GeoLocation created successfully";
  } catch (error) {
    logger.error("createGeoLocationTable error:", error);
    return error;
  }
};

export const describeDb = async (): Promise<any> => {
  const query = `
    SELECT table_schema,table_name FROM information_schema.tables
    ORDER BY table_schema,table_name;
  `;

  try {
    const db = getDbPool();
    const result = await db.query(query);
    return result;
  } catch (error) {
    logger.error("describeDb error:", error);
    return error;
  }
};

export const dumpDb = async (): Promise<any> => {
  const lawyersQuery = 'SELECT * from "Lawyer"';
  const addressQuery = 'SELECT * from "Address"';
  const geoQuery = 'SELECT * from "GeoLocation"';
  const countryQuery = 'SELECT * from "Country"';

  try {
    const db = getDbPool();
    const lawyers = await db.query(lawyersQuery);
    const address = await db.query(addressQuery);
    const geo = await db.query(geoQuery);
    const country = await db.query(countryQuery);
    return { lawyers, address, geo, country };
  } catch (error) {
    logger.error("dumpDb error:", error);
    return error;
  }
};

export async function prepareAndSeedDb(): Promise<string[]> {
  try {
    // logger.info("Prepare Database: Installing Postgis");
    // await createPostgis();
    // logger.info("Prepare Database: Create GeoLocation Table");
    // await createGeoLocationTable();
    logger.info("Prepare Database: Seeding data");
    return await seedDb(prisma);
  } catch (error) {
    logger.error(`prepareAndSeedDb Error: ${error.message}`);
    throw error;
  }
}
