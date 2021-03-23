import { PrismaClient } from "@prisma/client";
import { logger } from "services/loggerService";
import { populateThailandLawyers } from "./thailand/populate-thailand";
import { POPULATE_DB } from "config";

export const populateDb = async (prisma: PrismaClient): Promise<string[]> => {
  logger.info("Will populate DB", { POPULATE_DB });
  
  const results: string[] = [];
  results.push(await populateThailandLawyers(prisma));
  return results;
};
