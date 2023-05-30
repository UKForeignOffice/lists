import { compact, toLower, trim } from "lodash";
import { Prisma } from "@prisma/client";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "server/models/db/prisma-client";

import type { CountryName, List, ListCreateInput, ListUpdateInput } from "./types";
import type { ServiceType } from "shared/types";

export async function findListById(listId: string | number): Promise<List | undefined> {
  try {
    const lists = (await prisma.list.findUnique({
      where: {
        id: Number(listId),
      },
      include: {
        country: true,
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

export async function findListByAnnualReviewDate(annualReviewStartDate: Date): Promise<Result<List[]>> {
  try {
    logger.debug(`searching for lists matching date [${annualReviewStartDate}]`);

    const result = (await prisma.list.findMany({
      where: {
        nextAnnualReviewStartDate: {
          lte: annualReviewStartDate,
        },
      },
      include: {
        country: true,
        items: {
          where: {
            history: {
              some: {
                type: "PUBLISHED",
                time: {
                  lte: subMonths(Date.now(), 1),
                },
              },
            },
          },
          include: {
            history: {
              orderBy: {
                time: "desc",
              },
            },
          },
        },
      },
    })) as List[];

    logger.debug(`direct from query, found [${result.length}] lists`);

    return { result };
  } catch (error) {
    logger.error(`findListByCountryAndType Error: ${(error as Error).message}`);
    return { error: Error("Unable to get lists") };
  }
}

export async function findListsWithCurrentAnnualReview(): Promise<Result<List[]>> {
  try {
    const result = (await prisma.list.findMany({
      where: {
        jsonData: {
          path: ["currentAnnualReview", "eligibleListItems"],
          not: "",
        },
      },
      include: {
        country: true,
      },
    })) as List[];

    logger.debug(`direct from query, found [${result.length}] lists`);
    return { result };
  } catch (error) {
    logger.error(`findListsInAnnualReview Error: ${(error as Error).message}`);
    return { error: new Error("Unable to get lists in annual review") };
  }
}

export async function createList(listData: {
  country: CountryName;
  serviceType: ServiceType;
  users: string | string[];
  createdBy: string;
}): Promise<List | Record<string, boolean> | undefined> {
  try {
    const usersAsArray = Array.isArray(listData.users) ? listData.users : [listData.users];

    const users = compact(usersAsArray.map(trim).map(toLower));
    if (users.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Users contain a non GOV UK email address");
    }
    if (!isGovUKEmailAddress(listData.createdBy)) {
      throw new Error("CreatedBy is not a valid GOV UK email address");
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
        users,
        createdBy: listData.createdBy,
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

export async function updateList(
  listId: number,
  listData: {
    users: string[];
  }
): Promise<List | undefined> {
  try {
    const users = compact(listData.users.map(trim).map(toLower));
    if (users.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Users contain a non GOV UK email address");
    }

    const data: ListUpdateInput = {
      jsonData: {
        users,
      },
    };

    const list = (await prisma.list.update({
      where: {
        id: listId,
      },
      data,
    })) as List;
    return list ?? undefined;
  } catch (error) {
    logger.error(`updateList Error: ${(error as Error).message}`);
    throw error;
  }
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
