import pgescape from "pg-escape";
import { compact, toLower, trim } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";
import {
  List,
  CountryName,
  ServiceType,
  ListCreateInput,
  ListUpdateInput,
} from "./types";

export async function findUserLists(
  email: string
): Promise<List[] | undefined> {
  const emailAddress = pgescape.string(email.toLowerCase());

  try {
    const query = `
      SELECT *,
      (
        SELECT ROW_TO_JSON(c)
        FROM (
          SELECT name
          FROM "Country"
          WHERE "List"."countryId" = "Country"."id"
        ) as c
      ) as country
      FROM public."List"
      WHERE "jsonData"->'validators' @> '"${emailAddress}"'
      OR "jsonData"->'publishers' @> '"${emailAddress}"'
      OR "jsonData"->'administrators' @> '"${emailAddress}"'
      ORDER BY id ASC
    `;

    const lists = await prisma.$queryRaw(query);
    return lists ?? undefined;
  } catch (error) {
    logger.error(`findUserLists Error: ${error.message}`);
    return undefined;
  }
}

export async function findListById(
  listId: string | number
): Promise<List | undefined> {
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
    logger.error(`findListById Error: ${error.message}`);
    return undefined;
  }
}

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
    logger.error(`findListByCountryAndType Error: ${error.message}`);
    return undefined;
  }
}

export async function createList(listData: {
  country: CountryName;
  serviceType: ServiceType;
  validators: string[];
  publishers: string[];
  administrators: string[];
  createdBy: string;
}): Promise<List | undefined> {
  try {
    const validators = compact(listData.validators.map(trim).map(toLower));
    if (validators.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Validators contain a non GOV UK email address");
    }

    const publishers = compact(listData.publishers.map(trim).map(toLower));
    if (publishers.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Publishers contain a non GOV UK email address");
    }

    const administrators = compact(
      listData.administrators.map(trim).map(toLower)
    );
    if (administrators.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Administrators contain a non GOV UK email address");
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
        validators,
        publishers,
        administrators,
        createdBy: listData.createdBy,
      },
    };

    const list = (await prisma.list.create({ data })) as List;
    return list ?? undefined;
  } catch (error) {
    logger.error(`createList Error: ${error.message}`);
    throw error;
  }
}

export async function updateList(
  listId: number,
  listData: {
    validators: string[];
    publishers: string[];
    administrators: string[];
  }
): Promise<List | undefined> {
  try {
    const validators = compact(listData.validators.map(trim).map(toLower));
    if (validators.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Validators contain a non GOV UK email address");
    }

    const publishers = compact(listData.publishers.map(trim).map(toLower));
    if (publishers.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Publishers contain a non GOV UK email address");
    }

    const administrators = compact(
      listData.administrators.map(trim).map(toLower)
    );
    if (administrators.some((email) => !isGovUKEmailAddress(email))) {
      throw new Error("Administrators contain a non GOV UK email address");
    }

    const data: ListUpdateInput = {
      jsonData: {
        validators,
        publishers,
        administrators,
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
    logger.error(`updateList Error: ${error.message}`);
    throw error;
  }
}
