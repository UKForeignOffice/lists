import { prisma } from "./prisma-client";
import { getDbPool } from "./database";
import { logger } from "server/services/logger";
import { seedDb } from "./seed-data/seed-db";

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

export async function populateDb(): Promise<string[]> {
  try {
    logger.info("Prepare Database: Seeding data");
    return await seedDb(prisma);
  } catch (error) {
    logger.error(`prepareAndSeedDb Error: ${error.message}`);
    throw error;
  }
}
