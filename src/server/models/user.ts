import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "./db/prisma-client";
import { User, UserCreateInput } from "./types";

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ?? undefined;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
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
    const user = await prisma.user.create({ data });
    return user;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}

export async function updateUser(
  email: string,
  data: UserCreateInput
): Promise<User | undefined> {
  if (!isGovUKEmailAddress(data.email)) {
    logger.warn(`Trying to update non GOV.UK user ${data.email}`);
    return undefined;
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data,
    });
    return user;
  } catch (error) {
    logger.error(`findUserByEmail Error ${error.message}`);
    return undefined;
  }
}
