import { compact, toLower, trim } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";

import { List, CountryName, ServiceType, ListCreateInput, ListUpdateInput } from "./types";

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

export async function createList(listData: {
  country: CountryName;
  serviceType: ServiceType;
  users: string | string[];
  createdBy: string;
}): Promise<List | undefined> {
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
