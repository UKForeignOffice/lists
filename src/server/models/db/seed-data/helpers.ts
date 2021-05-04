import { PrismaClient, Country } from "@prisma/client";
import { uniq, upperFirst } from "lodash";
import { logger } from "server/services/logger";
import { CountriesWithData } from "../../types";
import { createLawyer } from "../../lawyers";

const postCodeExtractRegex: {
  [propName: string]: RegExp;
} = {
  Thailand: /(\d{5})(?!.*\1)/gm,
  France: /(\d{5})(?!.*\1)/gm,
  Italy: /(\d{5})(?!.*\1)/gm,
  Spain: /(\d{5})(?!.*\1)/gm,
};

function createLawyersQueryObjects(country: Country, lawyers: any[]): any[] {
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
      errors: string[];
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
  let country: Country;

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

  const errors: string[] = [];

  for (let i = 0; i < lawyersInsetObjList.length; i++) {
    const lawyer = lawyersInsetObjList[i];

    try {
      await createLawyer(lawyer);
      itemsInserted += 1;
    } catch (error) {
      errors.push(error.message);
    }
  }

  const result = {
    country: country.name,
    totalSuccess: itemsInserted,
    errors,
  };

  logger.info(`populateCountryLawyers for ${countryName}`, result);

  return result;
};
