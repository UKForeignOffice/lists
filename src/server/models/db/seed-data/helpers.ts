import { PrismaClient } from "@prisma/client";
import { logger } from "server/services/logger";
import { CountriesWithData } from "../../types";
import { createLawyer, approveLawyer, publishLawyer } from "../../lawyers";
import { LawyersFormWebhookData } from "server/services/form-runner";

function createLawyerJson(
  countryName: string,
  lawyers: any[]
): LawyersFormWebhookData[] {
  return lawyers.map((lawyer) => {
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
      city: lawyer.city ?? "",
      postcode: lawyer.postcode ?? "",
      country: `${countryName}`,
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
  const lawyerJsonList = createLawyerJson(countryName, lawyers);

  let itemsInserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < lawyerJsonList.length; i++) {
    const lawyer = lawyerJsonList[i];

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
    country: countryName,
    totalSuccess: itemsInserted,
    errors,
  };

  logger.info(`populateCountryLawyers for ${countryName}`, result);

  return result;
};
