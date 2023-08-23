import { omit } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "server/models/db/prisma-client";
import { UserRoles } from "./types";
import type { User } from "./types";

export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })) as User;

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}

export async function findUserById(id: number): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { id },
    })) as User;

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserById Error ${error.message}`);
    return undefined;
  }
}

export async function createUser(data: Partial<User>): Promise<User | undefined> {
  if (!isGovUKEmailAddress(data.email!)) {
    logger.warn(`Trying to create non GOV.UK user ${data.email}`);
    return undefined;
  }

  try {
    return (await prisma.user.create({
      // @ts-ignore
      data: {
        ...data,
        email: data.email!.toLowerCase(),
      },
    })) as User;
  } catch (error) {
    logger.error(`createUser Error ${error.message}`);
    return undefined;
  }
}

export async function updateUser(email: string, data: Partial<User>): Promise<User | undefined> {
  if (typeof data.email === "string" && !isGovUKEmailAddress(data.email)) {
    logger.warn(`Trying to update non GOV.UK user ${data.email}`);
    return undefined;
  }

  try {
    return (await prisma.user.update({
      where: { email: email.toLocaleLowerCase() },
      data: omit(data, ["email"]),
    })) as User;
  } catch (error) {
    logger.error(`updateUser Error ${error.message}`);
    return undefined;
  }
}

interface UserWithListCount {
  email: string;
  jsonData: {
    roles: UserRoles[];
  };
  count: number;
}

export async function findUsersWithListCount(): Promise<UserWithListCount[]> {
  try {
    const userWithListCount = await prisma.$queryRaw`
      select email, "User"."jsonData", count("List".id) as count
      from "User"
        left join lateral (
          select id
          from "List"
          where "jsonData"->'users' ? "User".email
        ) as "List" on true
      group by "User".email, "User"."jsonData"
      order by "User".email asc;
    `;

    return userWithListCount as UserWithListCount[];
  } catch (error) {
    logger.error(`findUsersWithListCount Error ${error.message}`);
    return [];
  }
}

interface UserWithListData {
  type: string;
  countryName: string;
  email: string;
  jsonData: { roles: UserRoles[] };
}

export async function getUsersWithListDataByEmail(email: string): Promise<UserWithListData[] | []> {
  try {
    const userWithListCount = await prisma.$queryRaw`
      select "List".type, "Country".name as "countryName", "User".email, "User"."jsonData"
      from "User"
      left join "List" on "List"."jsonData"->'users' ? ${email}
      left join "Country" on "Country".id = "List"."countryId"
      where "User".email = ${email};
    `;
    return userWithListCount as UserWithListData[];
  } catch (error) {
    logger.error(`getUsersWithListDataByEmail Error ${error.message}`);
    return [];
  }
}

export async function isAdministrator(email: string | undefined): Promise<boolean> {
  try {
    if (!email) {
      return false;
    }
    const user = await findUserByEmail(email);
    return user?.jsonData.roles?.includes(UserRoles.Administrator) === true;
  } catch (error) {
    logger.error(`isAdministratorUser Error: ${error.message}`);
    throw error;
  }
}
