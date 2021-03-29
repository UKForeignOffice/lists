import { PrismaClient } from "@prisma/client";
import { uniq, isArray, upperFirst } from "lodash";
import { logger } from "services/logger";
import { locatePlaceByText } from "services/location";
import { rawInsertGeoLocation } from "../helpers";

const postCodeExtractRegex = {
  Thailand: /(\d{5})(?!.*\1)/gm,
  France: /(\d{5})(?!.*\1)/gm,
};

function createLawyersQueryObjects(
  country: { id: number; name: string },
  lawyers: any[]
): any[] {
  const postCodeRegex = postCodeExtractRegex[country.name];

  if (postCodeRegex === undefined) {
    throw new Error(
      `Missing postcode extract regex for country ${country.name}`
    );
  }

  return lawyers.map((lawyer) => {
    const legalPracticeAreasList = uniq(lawyer.legalPracticeAreas.split("; "));

    const postCodeFromAddress: string =
      lawyer.address.match(postCodeRegex)?.["0"] ?? "";

    return {
      contactName: lawyer.contactName ?? lawyer.lawFirmName,
      lawFirmName: lawyer.lawFirmName ?? lawyer.contactName,
      telephone: lawyer.telephone,
      email: "",
      website: "",
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
      regionsServed: lawyer["Regions Served"],
      legalAid: lawyer["Legal Aid"] === "Yes",
      proBonoService: false,
      isApproved: true,
      isPublished: true,
    };
  });
}

export const populateCountryLawyers = async (
  countryName: string,
  lawyers: any[],
  prisma: PrismaClient
): Promise<string> => {
  const name = upperFirst(countryName);
  const country = await prisma.country.upsert({
    where: { name },
    update: { name },
    create: { name },
  });

  const lawyersInsetObjList = createLawyersQueryObjects(country, lawyers);

  let itemsInserted = 0;
  let alreadyExists = 0;
  let itemsError = 0;

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
      itemsError += 1;
      logger.error(`Populate ${countryName} lawyers Error:`, error);
    }
  }

  const result = `${itemsInserted} ${countryName} Lawyers created successfully, ${itemsError} errors, ${alreadyExists} already existed`;

  logger.info(result);

  return result;
};
