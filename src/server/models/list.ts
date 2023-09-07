import { Prisma } from "@prisma/client";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "server/models/db/prisma-client";

import type { CountryName, List, ListCreateInput, User } from "./types";
import type { ServiceType } from "shared/types";

export async function findListById(listId: string | number): Promise<List | undefined> {
  try {
    const lists = (await prisma.list.findUnique({
      where: {
        id: Number(listId),
      },
      include: {
        country: true,
        users: true,
      },
    })) as List;
    return lists ?? undefined;
  } catch (error) {
    logger.error(`findListById Error: ${(error as Error).message}`);
    return undefined;
  }
}

export async function findListByCountryAndType(country: CountryName, type: ServiceType): Promise<List[] | undefined> {
  try {
    const lists = (await prisma.list.findMany({
      where: {
        country: {
          name: country,
        },
        type,
      },
      include: {
        country: true,
      },
    })) as List[];
    return lists ?? undefined;
  } catch (error) {
    logger.error(`findListByCountryAndType Error: ${(error as Error).message}`);
    return undefined;
  }
}

export async function findListsByCountry(country: CountryName): Promise<List[] | undefined> {
  try {
    const lists = (await prisma.list.findMany({
      where: {
        country: {
          name: country,
        },
      },
    })) as List[];
    return lists;
  } catch (error) {
    logger.error(`findListsByCountry Error: ${(error as Error).message}`);
    return undefined;
  }
}

export async function createList(listData: {
  country: CountryName;
  serviceType: ServiceType;
  user: string;
  createdBy: string;
}): Promise<List | Record<string, boolean> | undefined> {
  try {
    const user = listData.user.toLowerCase().trim();

    if (!isGovUKEmailAddress(user)) {
      throw new Error("User contain a non GOV UK email address");
    }
    if (!isGovUKEmailAddress(listData.createdBy)) {
      throw new Error("CreatedBy is not a valid GOV UK email address");
    }

    const userExists = await checkUserExists(user);

    if (!userExists) {
      await createUsersFromEmails(user);
    }

    const data: ListCreateInput = {
      type: listData.serviceType,
      country: {
        connectOrCreate: {
          where: {
            name: listData.country,
          },
          create: {
            name: listData.country,
          },
        },
      },
      jsonData: {
        relatedLinks: getRelatedLinks(listData.serviceType),
        createdBy: listData.createdBy,
      },
      users: {
        connect: {
          email: listData.user,
        },
      },
    };

    const list = (await prisma.list.create({ data })) as List;
    return list ?? undefined;
  } catch (error) {
    logger.error(`createList Error: ${(error as Error).message}`);
    const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR_CODE) {
      logger.error(`createList Error: A list already exists for this country`);
      return { duplicateListError: true };
    }
    throw error;
  }
}

export function getRelatedLinks(serviceType: ServiceType) {
  const lawyersLinks = [
    {
      url: "https://gov.uk/guidance/arrested-or-detained-abroad",
      text: "Arrested or detained abroad",
    },
    {
      url: "https://gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
      text: "What to do after a British national dies abroad",
    },
    {
      url: "https://gov.uk/guidance/victim-of-crime-abroad",
      text: "Victim of crime abroad",
    },
  ];
  const funeralDirectorLinks = [
    {
      url: "https://gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
      text: "What to do after a British national dies abroad",
    },
    {
      url: "https://www.gov.uk/government/publications/international-funeral-directors-in-the-uk",
      text: "UK-based international funeral directors",
    },
    {
      url: "https://gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
      text: "Tell us once",
    },
  ];

  const translatorLinks = [
    {
      url: "https://gov.uk/guidance/arrested-or-detained-abroad",
      text: "Arrested or detained abroad",
    },
    {
      url: "https://gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
      text: "What to do after a British national dies abroad",
    },
    {
      url: "https://gov.uk/guidance/in-hospital-abroad",
      text: "In hospital abroad",
    },
    {
      url: "https://gov.uk/guidance/victim-of-crime-abroad",
      text: "Victim of crime abroad",
    },
  ];

  const linksServices = {
    lawyers: lawyersLinks,
    funeralDirectors: funeralDirectorLinks,
    translators: translatorLinks,
  };

  return linksServices[serviceType as keyof typeof linksServices];
}

export async function updateList(
  listId: number,
  listData: {
    user: string;
  }
): Promise<List | undefined> {
  try {
    const user = listData.user.toLowerCase().trim();

    if (!isGovUKEmailAddress(user)) {
      throw new Error("User contain a non GOV UK email address");
    }

    const userExists = await checkUserExists(user);

    if (!userExists) {
      await createUsersFromEmails(user);
    }

    const list = (await prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        users: {
          connect: {
            email: listData.user,
          },
        },
      },
    })) as List;
    return list ?? undefined;
  } catch (error) {
    logger.error(`updateList Error: ${(error as Error).message}`);
    throw error;
  }
}

export async function removeUserFromList(listId: number, userEmail: string): Promise<void> {
  try {
    await prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        users: {
          disconnect: {
            email: userEmail,
          },
        },
      },
    });
    logger.info(`User ${userEmail} disconnected from list ${listId}`);
  } catch (error) {
    logger.error(`removeUserFromList Error: ${(error as Error).message}`);
    throw error;
  }
}

async function createUsersFromEmails(email: string): Promise<void> {
  await prisma.user.create({
    data: {
      email,
      jsonData: {
        roles: [],
      },
    },
  });

  logger.info(`Created users for ${email}`);
}

async function checkUserExists(email: string): Promise<User> {
  const res = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return res as User;
}
/**
 * todo: deprecate
 */
export async function updateAnnualReviewDate(listId: string, nextAnnualReviewStartDate: string): Promise<void> {
  await prisma.list.update({
    where: {
      id: Number(listId),
    },
    data: {
      nextAnnualReviewStartDate,
    },
  });
}
