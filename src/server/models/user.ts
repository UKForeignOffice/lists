import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";
import { User, UserCreateInput, UserRoles, UserUpdateInput } from "./types";

// TODO: test
export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { email },
    })) as User;

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}

// TODO: test
export async function createUser(
  data: UserCreateInput
): Promise<User | undefined> {
  if (!isGovUKEmailAddress(data.email)) {
    logger.warn(`Trying to create non GOV.UK user ${data.email}`);
    return undefined;
  }

  try {
    return (await prisma.user.create({ data })) as User;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}

// TODO: test
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
      where: { email },
      data,
    })) as User;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}

// TODO: test
export async function findUsers(): Promise<User[]> {
  try {
    return (await prisma.user.findMany()) as User[];
  } catch (error) {
    logger.error(`listUsers Error ${error.message}`);
    return [];
  }
}

// TODO: test
export async function isSuperAdminUser(email: string): Promise<boolean> {
  try {
    const user = await findUserByEmail(email);
    return user?.jsonData.roles?.includes(UserRoles.SuperAdmin) === true;
  } catch (error) {
    logger.error(`isSuperAdmin Error: ${error.message}`);
    throw error;
  }
}
