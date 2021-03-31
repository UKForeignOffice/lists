import { PrismaClient } from "@prisma/client";
import { logger } from "services/logger";

import { populateCountryLawyers } from "./helpers";

import { thailandLawyers } from "./thailand";
import { franceLawyers } from "./france";
import { italyLawyers } from "./italy";
import { spainLawyers } from "./spain";

const CountriesWithData = [
  {
    name: "Thailand",
    lawyers: thailandLawyers,
  },
  {
    name: "France",
    lawyers: franceLawyers,
  },
  {
    name: "Italy",
    lawyers: italyLawyers,
  },
  {
    name: "Spain",
    lawyers: spainLawyers,
  },
];

export const populateDb = async (prisma: PrismaClient): Promise<string[]> => {
  const results: any[] = [];

  for (let i = 0; i < CountriesWithData.length; i += 1) {
    const country = CountriesWithData[i];
    logger.info(`Will populate DB for country ${country.name}`);

    try {
      results.push(
        await populateCountryLawyers(country.name, country.lawyers, prisma)
      );
    } catch (error) {
      results.push(error);
    }
  }

  return results;
};
