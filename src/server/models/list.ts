import { toLower, trim } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";
import { List, CountryName, ServiceType, ListCreateInput } from "./types";

// TODO: test
export async function findListById(listId: string): Promise<List | undefined> {
  try {
    const lists = (await prisma.list.findUnique({
      where: {
        id: Number(listId),
      },
    })) as List;
    return lists ?? undefined;
  } catch (error) {
    logger.error(`findList Error ${error.message}`);
    return undefined;
  }
}

// TODO: test
export async function findListByCountryAndType(
  country: CountryName,
  type: ServiceType
): Promise<List[] | undefined> {
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
    logger.error(`findList Error ${error.message}`);
    return undefined;
  }
}

// TODO: test
export async function createList(listData: {
  country: CountryName;
  serviceType: ServiceType;
  editors: string[];
  publishers: string[];
}): Promise<List | undefined> {
  try {
    // TODO: validate country+type list won't duplicate
    const editors = listData.editors.map(trim).map(toLower);
    if (editors.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Editors contain a non GOV UK email address");
    }

    const publishers = listData.publishers.map(trim).map(toLower);
    if (publishers.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Publishers contain a non GOV UK email address");
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
        editors,
        publishers,
      },
    };

    const list = (await prisma.list.create({ data })) as List;
    return list ?? undefined;
  } catch (error) {
    logger.error(`createList Error ${error.message}`);
    throw error;
  }
}

// TODO: test
// export async function findListsAssignedToUser(email: string): Promise<List[]> {}
