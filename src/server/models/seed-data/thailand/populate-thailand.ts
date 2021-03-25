import { PrismaClient } from "@prisma/client";
import { uniq, isArray } from "lodash";
import { logger } from "services/logger";
import { locatePlaceByText } from "services/location";
import { rawInsertGeoLocation } from "../../helpers";

import lawyers from "./thailand-lawyers";

function createLawyersQueryObjects(country: { id: number }): any[] {
  return lawyers.map((lawyer) => {
    const address = lawyer.Address.substring(
      0,
      lawyer.Address.length - 6
    ).replace(/,\s*$/, "");

    const legalPracticeAreasList = uniq(
      lawyer["Legal Practice Areas"].split("; ")
    );

    const postCodeFromAddress: string =
      lawyer.Address.match(/\d{5}/gm)?.["0"] ?? "";

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
}

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

  const lawyersInsetObjList = createLawyersQueryObjects(country);

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
      logger.error("Error creating thailand lawyer", error);
    }
  }

  const result = `${itemsInserted} Thailand Lawyers created successfully, ${itemsError} errors, ${alreadyExists} already existed`;

  logger.info(result);

  return result;
};
