import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import type { ServiceType, List } from "shared/types";

export async function getRelatedLinks(countryName: string, serviceType: ServiceType) {
  const list = await prisma.list.findFirst({
    where: {
      country: {
        name: {
          equals: countryName,
          mode: "insensitive",
        },
      },
      type: serviceType,
    },
    select: {
      id: true,
      jsonData: true,
    },
  });

  if (!list) {
    logger.info(`getRelatedLinks for ${countryName} ${serviceType}, list not found`);
    return [];
  }

  const { jsonData } = list as List;
  const { relatedLinks = [] } = jsonData;

  if (relatedLinks.length === 0) {
    logger.info(`getRelatedLinks for ${list.id} (${countryName}, ${serviceType}) returned with 0 links`);
  }

  return relatedLinks;
}
