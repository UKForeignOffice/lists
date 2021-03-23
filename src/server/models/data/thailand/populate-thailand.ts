import { PrismaClient } from "@prisma/client";
import { uniq } from "lodash";
import { logger } from "services/logger";
import lawyers from "./thailand-lawyers";

export const populateThailandLawyers = async (
  prisma: PrismaClient
): Promise<string> => {
  const country = await prisma.country.upsert({
    where: {
      name: "Thailand",
    },
    update: {
      name: "Thailand",
    },
    create: {
      name: "Thailand",
    },
  });

  const listOfLawyers = lawyers.map((lawyer) => {
    const address = lawyer.Address.substring(
      0,
      lawyer.Address.length - 6
    ).replace(/,\s*$/, "");

    const legalPracticeAreasList = uniq(
      lawyer["Legal Practice Areas"].split("; ")
    );

    const postCodeFromAddress: string = lawyer.Address.match(/\d{5}/gm)?.["0"] ?? '';

    return {
      contactName: lawyer.Name,
      lawFirmName: lawyer.Name,
      telephone: lawyer.Telephone,
      email: "",
      website: "",
      address: {
        create: {
          firsLine: address,
          postCode: postCodeFromAddress,
          country: {
            connect: { id: country.id },
          },
        },
      },
      legalPracticeAreas: {
        connectOrCreate: legalPracticeAreasList
          .map((name) => name.trim())
          .map((name) => ({
            where: { name },
            create: { name },
          })),
      },
      regionsServed: lawyer["Regions Served"],
      legalAid: lawyer["Legal Aid"] === "Yes",
      proBonoService: false,
      isApproved: true,
      isPublished: true,
    };
  });

  let itemsInserted = 0;
  let itemsError = 0;
  let alreadyExists = 0;

  for (let i = 0; i < listOfLawyers.length; i++) {
    const lawyer = listOfLawyers[i];
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
      await prisma.lawyer.create({ data: lawyer });
      itemsInserted += 1;
    } catch (error) {
      itemsError += 1;
      logger.error(error);
    }
  }

  const result = `
    ${itemsInserted} Thailand Lawyers Records created successfully, 
    ${itemsError} errors, 
    ${alreadyExists} already existed
  `;
  
  logger.info(result);

  return result;
};
