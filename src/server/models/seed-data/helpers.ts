import { PrismaClient, country } from "@prisma/client";
import { uniq, isArray, upperFirst } from "lodash";
import { logger } from "services/logger";
import { locatePlaceByText } from "services/location";
import { rawInsertGeoLocation } from "../helpers";
import { CountriesWithData } from "../types";

const postCodeExtractRegex: {
  [propName: string]: RegExp;
} = {
  Thailand: /(\d{5})(?!.*\1)/gm,
  France: /(\d{5})(?!.*\1)/gm,
  Italy: /(\d{5})(?!.*\1)/gm,
  Spain: /(\d{5})(?!.*\1)/gm,
};

function createLawyersQueryObjects(
  country: country,
  lawyers: any[]
): any[] {
  const postCodeRegex = postCodeExtractRegex[country.name];

  if (postCodeRegex === undefined) {
    throw new Error(
      `Missing postcode extract regex for country ${country.name}`
    );
  }

  return lawyers.map((lawyer) => {
    const legalPracticeAreasList = uniq<string>(
      lawyer.legalPracticeAreas?.split("; ") ?? []
    );

    const postCodeFromAddress: string =
      lawyer.address?.match(postCodeRegex)?.["0"] ?? "";

    return {
      contactName: lawyer.contactName ?? lawyer.lawFirmName,
      lawFirmName: lawyer.lawFirmName ?? lawyer.contactName,
      telephone: lawyer.telephone,
      email: lawyer.email ?? "",
      website: lawyer.website ?? "",
      description: lawyer.description ?? "",
      address: {
        create: {
          firsLine: lawyer.address,
          postCode: postCodeFromAddress,
          country: {
            connect: { id: country.id },
          },
        },
      },
      legalPracticeAreas: {
        connectOrCreate: legalPracticeAreasList
          .map((name: string) => name.trim())
          .map((name) => ({
            where: { name },
            create: { name },
          })),
      },
      regionsServed: lawyer.regionsServed,
      legalAid: lawyer.legalAid === "Yes",
      proBonoService: false,
      isApproved: true,
      isPublished: true,
    };
  });
}

type PopulateCountryLawyers = (
  countryName: CountriesWithData,
  lawyers: any[],
  prisma: PrismaClient
) => Promise<
  | {
      country: string;
      totalSuccess: number;
      totalErrors: number;
      alreadyExists: number;
      errors: Error[];
    }
  | {
      country: string;
      error: any;
    }
>;

export const populateCountryLawyers: PopulateCountryLawyers = async (
  countryName,
  lawyers,
  prisma
) => {
  const name = upperFirst(countryName);
  let country: country;

  try {
    country = await prisma.country.upsert({
      where: { name },
      update: { name },
      create: { name },
    });
  } catch (error) {
    logger.error("Create country error", error);
    return { country: countryName, error: error.message };
  }

  let lawyersInsetObjList;

  try {
    lawyersInsetObjList = createLawyersQueryObjects(country, lawyers);
  } catch (error) {
    logger.error("createLawyersQueryObjects", error);

    return { country: countryName, error: error.message };
  }

  let itemsInserted = 0;
  let alreadyExists = 0;
  let itemsError = 0;

  const errors: Error[] = [];

  for (let i = 0; i < lawyersInsetObjList.length; i++) {
    const lawyer = lawyersInsetObjList[i];
    const exists = await prisma.lawyer.findFirst({
      where: {
        lawFirmName: lawyer.lawFirmName,
      },
    });

    if (exists !== null) {
      alreadyExists += 1;
      continue;
    }

    try {
      const location = await locatePlaceByText(lawyer.address.create.firsLine);
      const point = location?.Geometry?.Point;

      if (isArray(point)) {
        const locationId = await rawInsertGeoLocation(point);

        if (locationId >= 0) {
          Object.assign(lawyer.address.create, {
            geoLocationId: locationId,
          });
        }
      }

      await prisma.lawyer.create({ data: lawyer });
      itemsInserted += 1;
    } catch (error) {
      errors.push(error.message);
      itemsError += 1;
      logger.error(`Populate ${countryName} lawyers Error:`, error);
    }
  }

  const result = {
    country: country.name,
    totalSuccess: itemsInserted,
    totalErrors: itemsError,
    alreadyExists: alreadyExists,
    errors,
  };

  logger.info(`populateCountryLawyers for ${countryName}`, result);

  return result;
};
