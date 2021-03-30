import { PrismaClient } from "@prisma/client";
import { logger } from "services/logger";
import { POPULATE_DB } from "config";

import { populateCountryLawyers } from "./helpers";

import thailandLawyers from "./thailand";
import franceLawyers from "./france";
import italyLawyers from "./italy";

export const populateDb = async (prisma: PrismaClient): Promise<string[]> => {
  logger.info("Will populate DB", { POPULATE_DB });

  const results: string[] = [];
  results.push(
    await populateCountryLawyers("Thailand", thailandLawyers, prisma)
  );
  results.push(await populateCountryLawyers("France", franceLawyers, prisma));
  results.push(await populateCountryLawyers("Italy", italyLawyers, prisma));
  return results;
};
