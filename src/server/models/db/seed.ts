import { prisma } from "./prisma-client";
import { seedDb } from "./seed-data/seed-db";
import { logger } from "server/services/logger";
import { createPostgis, createGeoLocationTable } from "./helpers";

export async function prepareAndSeedDb(): Promise<string[]> {
  try {
    logger.info("Prepare Database: Installing Postgis");
    await createPostgis();
    logger.info("Prepare Database: Create GeoLocation Table");
    await createGeoLocationTable();
    logger.info("Prepare Database: Seeding data");
    return await seedDb(prisma);
  } catch (error) {
    logger.error(`prepareAndSeedDb Error: ${error.message}`);
    throw error;
  }
}
