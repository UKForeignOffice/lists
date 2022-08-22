import { prisma } from "../models/db/prisma-client";
import { logger } from "../services/logger";
import { createList } from "../models/list";
import { countriesList } from "../services/metadata";
import { isTest } from "../config";

import { ServiceType } from "../models/types";
import type { CountryName, List, ListJsonData, Country } from "../models/types";

const DEFAULT_USER_EMAIL = "ali@cautionyourblast.com";

export const errorMessages = {
  serviceType: "Incorrect service type entered",
  newCountries: "No new countries are needed for this service type",
  missingList: (listType: string, listCountry?: string) =>
    `List could not be found for ${listType} ${
      listCountry && `with country ${listCountry.trim()}`
    }`,
} as const;

/**
 * This script compares the number of countries a service has in the db with what's in the countriesList metadat.ts file
 * and adds countries that are missing to the db for that specific service.
 *
 * @example npm run add-missing-countries -- --service lawyers
 * @example npm run add-missing-countries -- --service lawyers --emails "ali@cautionyourblast.com, jen@cautionyourblast.com"
 * @example npm run add-missing-countries -- --service lawyers --emails "funeralDirectors"
 * @example npm run add-missing-countries -- --service lawyers --emails "funeralDirectors, france"
 */
async function addMissingCountriesScript(): Promise<void> {
  const serviceTypeIdentifier = process.argv[3];
  const serviceType = process.argv[4];
  const emailsString = process.argv[6];
  const emails = emailsString.split(",");

  if (serviceTypeIdentifier !== "--service") {
    logger.error(
      'Service type not correctly provided, try adding "-- --service" to the command'
    );
    process.exit();
  }

  await addMissingCountriesToService(serviceType, emails);
  process.exit();
}

export async function addMissingCountriesToService(
  serviceType: string,
  listCreatedBy?: string[]
): Promise<void> {
  try {
    if (!checkServiceTypeExists(serviceType)) {
      throw new Error(errorMessages.serviceType);
    }
    const userEmails = listCreatedBy ?? [DEFAULT_USER_EMAIL];
    const serviceNameExistsInEmailsArray =
      listCreatedBy && checkServiceTypeExists(listCreatedBy[0]);

    let emailFields: ListJsonData = {
      validators: userEmails,
      publishers: userEmails,
      administrators: userEmails,
    };

    if (serviceNameExistsInEmailsArray) {
      emailFields = (await getEmailsFromExistingList(
        listCreatedBy as string[]
      )) as ListJsonData;
    }

    const typedServiceType = serviceType as ServiceType;
    const missingCountries = (await getMissingCountries(
      typedServiceType
    )) as CountryName[];

    if (missingCountries.length === 0) {
      throw new Error(errorMessages.newCountries);
    }

    logger.info(
      `${missingCountries.length} countries will be added to the ${typedServiceType} service`
    );

    for (const country of missingCountries) {
      const listDataForDB = {
        country,
        serviceType: typedServiceType,
        createdBy: emailFields.publishers[0],
        ...emailFields,
      };

      await createList(listDataForDB);
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

async function getEmailsFromExistingList(
  listInfo: string[]
): Promise<ListJsonData | undefined> {
  try {
    const listType = listInfo[0];
    const listCountry = listInfo[1];
    const searchCountry = listCountry
      ? {
          countryId: await getCountryIdFromName(listCountry),
        }
      : {};
    const selectedList = (await prisma.list.findFirst({
      where: { type: listType, ...searchCountry },
    })) as List;

    if (!selectedList) {
      throw new Error(errorMessages.missingList(listType, listCountry));
    }

    return selectedList.jsonData;
  } catch (error: unknown) {
    logErrorMessage(error, "getEmailsFromExistingList");
  }
}

async function getCountryIdFromName(countryFromArg: string): Promise<number> {
  const countryName = nameFromCountriesList(countryFromArg);
  const countryDataFromDB = (await prisma.country.findFirst({
    where: {
      name: countryName,
    },
  })) as Country;

  return countryDataFromDB.id;
}

function nameFromCountriesList(countryFromArg: string): string {
  const country = countriesList.find(
    (country) =>
      country.text.toLowerCase() === countryFromArg.trim().toLowerCase()
  ) as Record<string, string>;

  return country.text;
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

if (!isTest) {
  addMissingCountriesScript().catch((err) =>
    logErrorMessage(err, "addMissingCountriesCLI")
  );
}
