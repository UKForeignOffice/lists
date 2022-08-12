import { prisma } from "../models/db/prisma-client";
import { logger } from "../services/logger";
import { createList } from "../models/list";
import { countriesList } from "../services/metadata";

import { ServiceType } from "../models/types";
import type { CountryName, List } from "../models/types";

const DEFAULT_USER_EMAIL = "ali@cautionyourblast.com";

/**
 * This script compares the number of countries a service has in the db with what's in the countriesList metadat.ts file
 * and adds countries that are missing to the db for that specific service.
 *
 * @example npm run add-missing-countries -- --service lawyers
 * @example npm run add-missing-countries -- --service lawyers --emails "ali@cautionyourblast.com, jen@cautionyourblast.com"
 */
async function addMissingCountriesCLI(): Promise<void> {
  let emails: string[] = [];

  if (process.argv[3] !== "--service") {
    logger.error(
      'Service type not correctly provided, try adding "-- --service" to the command'
    );
    process.exit();
  }

  if (process.argv[5] === "--emails") {
    emails = process.argv[6].split(",");
  }

  const serviceType = process.argv[4];

  await addMissingCountriesToService(serviceType, emails);
  process.exit();
}

async function addMissingCountriesToService(
  serviceType: string,
  listCreatedBy?: string[]
): Promise<void> {
  try {
    if (!checkServiceTypeExists(serviceType)) {
      logger.error("Incorrect service type entered");
      return;
    }

    const typedServiceType = serviceType as ServiceType;
    const missingCountries = (await getMissingCountries(
      typedServiceType
    )) as CountryName[];

    if (missingCountries.length === 0) {
      logger.error("Now new countries are needed for this service type");
      return;
    }

    logger.info(
      `${missingCountries.length} countries will be added to the ${typedServiceType} service`
    );

    for (const country of missingCountries) {
      const userEmails = listCreatedBy ?? [DEFAULT_USER_EMAIL];
      const data = {
        country,
        serviceType: typedServiceType,
        validators: userEmails,
        publishers: userEmails,
        administrators: userEmails,
        createdBy: userEmails[0],
      };

      await createList(data);
    }
  } catch (error: unknown) {
    logErrorMessage(error, "addMissingCountriesToService");
  }
}

function checkServiceTypeExists(serviceType: string): boolean {
  for (const key in ServiceType) {
    if (serviceType === ServiceType[key as ServiceType]) return true;
  }

  return false;
}

async function getMissingCountries(
  serviceType: ServiceType
): Promise<CountryName[] | undefined> {
  try {
    const listsOfServiceType = (await prisma.list.findMany({
      where: { type: serviceType },
      include: {
        country: true,
      },
    })) as List[];

    const countriesFromLists = listsOfServiceType.map(
      (list: List) => list.country?.name
    ) as CountryName[];

    const formatedMetadataCountries = countriesList.map(
      (country) => country.text
    );
    const missingCountriesFromLists = formatedMetadataCountries.filter(
      (country) => !countriesFromLists.includes(country)
    );

    return missingCountriesFromLists;
  } catch (error: unknown) {
    logErrorMessage(error, "getMissingCountries");
  }
}

function logErrorMessage(error: unknown, functionName: string): Error {
  const typedError = error as Error;
  logger.error(`${functionName} Error: ${typedError.message}`);
  throw error;
}

addMissingCountriesCLI().catch((err) =>
  logErrorMessage(err, "addMissingCountriesCLI")
);
