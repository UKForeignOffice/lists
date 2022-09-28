import { omit } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";
import { User, UserCreateInput, UserRoles, UserUpdateInput } from "./types";

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })) as User;

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserByEmail Error ${(error as Error).message}`);
    return undefined;
  }
}

export async function findUserById(
  id: number
): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { id },
    })) as User;

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserById Error ${(error as Error).message}`);
    return undefined;
  }
}

export async function createUser(
  data: UserCreateInput
): Promise<User | undefined> {
  if (!isGovUKEmailAddress(data.email)) {
    logger.warn(`Trying to create non GOV.UK user ${data.email}`);
    return undefined;
  }

  try {
    return (await prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    })) as User;
  } catch (error) {
    logger.error(`createUser Error ${(error as Error).message}`);
    return undefined;
  }
}

export async function updateUser(
  email: string,
  data: UserUpdateInput
): Promise<User | undefined> {
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
    logger.error(`updateUser Error ${(error as Error).message}`);
    return undefined;
  }
}

export async function findUsers(): Promise<User[]> {
  try {
    return (await prisma.user.findMany({
      orderBy: {
        email: "asc",
      },
    })) as User[];
  } catch (error) {
    logger.error(`findUsers Error ${(error as Error).message}`);
    return [];
  }
}

export async function isSuperAdminUser(email: string): Promise<boolean> {
  try {
    const user = await findUserByEmail(email);
    return user?.jsonData.roles?.includes(UserRoles.SuperAdmin) === true;
  } catch (error) {
    logger.error(`isSuperAdminUser Error: ${(error as Error).message}`);
    throw error;
  }
}
