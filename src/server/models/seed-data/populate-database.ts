import { PrismaClient } from "@prisma/client";
import { logger } from "services/logger";
import { POPULATE_DB } from "config";

import { populateCountryLawyers } from "./helpers";
import thailandLawyers from "./thailand/thailand-lawyers";
import franceLawyers from "./france/france-lawyers";

export const populateDb = async (prisma: PrismaClient): Promise<string[]> => {
  logger.info("Will populate DB", { POPULATE_DB });

  const results: string[] = [];
  results.push(
    await populateCountryLawyers("Thailand", thailandLawyers, prisma)
  );
  results.push(await populateCountryLawyers("France", franceLawyers, prisma));
  return results;
};
