import { PrismaClient, Country } from "@prisma/client";
import { upperFirst } from "lodash";
import { logger } from "server/services/logger";
import { CountriesWithData } from "../../types";
import { createLawyer, approveLawyer, publishLawyer } from "../../lawyers";
import { LawyersFormWebhookData } from "server/services/form-runner";

const postCodeExtractRegex: {
  [propName: string]: RegExp;
} = {
  Thailand: /(\d{5})(?!.*\1)/gm,
  France: /(\d{5})(?!.*\1)/gm,
  Italy: /(\d{5})(?!.*\1)/gm,
  Spain: /(\d{5})(?!.*\1)/gm,
};

function createLawyersQueryObjects(
  country: Country,
  lawyers: any[]
): LawyersFormWebhookData[] {
  const postCodeRegex = postCodeExtractRegex[country.name];

  if (postCodeRegex === undefined) {
    throw new Error(
      `Missing postcode extract regex for country ${country.name}`
    );
  }

  return lawyers.map((lawyer) => {
    const postCodeFromAddress: string =
      lawyer.address?.match(postCodeRegex)?.["0"] ?? "";

    return {
      speakEnglish: true,
      englishSpeakLead: true,
      qualifiedToPracticeLaw: true,
      firstName: (lawyer.contactName ?? "").split(/[\s,]+/)[0],
      middleName: undefined,
      surname: (lawyer.contactName ?? "")
        .split(/[\s,]+/)
        .slice(1)
        .join(" "),
      organisationName: lawyer.lawFirmName ?? lawyer.contactName,
      websiteAddress: lawyer.website ?? "",
      emailAddress: lawyer.email ?? "",
      phoneNumber: lawyer.telephone,
      addressLine1: lawyer.address,
      addressLine2: undefined,
      city: "",
      postcode: postCodeFromAddress,
      country: `${country.name}`,
      areasOfLaw: lawyer.legalPracticeAreas?.replace(";", ","),
      canProvideLegalAid: lawyer.legalAid === "Yes",
      canOfferProBono: lawyer.proBonoService === "Yes",
      representedBritishNationalsBefore: true,
      memberOfRegulatoryAuthority: true,
      regulatoryAuthority: "",
      outOfHoursService: false,
      outOfHoursContactDetailsDifferent: false,
      outOfHoursContactDetailsDifferences: "",
      declarationConfirm: "confirm",
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
      const newLawyer = await createLawyer(lawyer);
      await approveLawyer(newLawyer.lawFirmName);
      await publishLawyer(newLawyer.lawFirmName);
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
