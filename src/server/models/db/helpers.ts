import { prisma } from "./prisma-client";
import { logger } from "server/services/logger";
import { seedDb } from "./seed-data/seed-db";

export async function populateDb(): Promise<string[]> {
  try {
    logger.info("Prepare Database: Seeding data");
    return await seedDb(prisma);
  } catch (error) {
    logger.error(`prepareAndSeedDb Error: ${error.message}`);
    throw error;
  }
}
