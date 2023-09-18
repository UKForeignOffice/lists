import { omit } from "lodash";
import { logger } from "server/services/logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { prisma } from "server/models/db/prisma-client";
import { UserRoles } from "./types";
import type { User } from "./types";
import { AuditEvent } from "@prisma/client";

export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = (await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        lists: {
          include: {
            country: true,
          },
        },
      },
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

export async function getUsersWithList(): Promise<User[]> {
  try {
    return (await prisma.user.findMany({
      orderBy: {
        email: "asc",
      },
      include: {
        lists: true,
      },
    })) as User[];
  } catch (error) {
    logger.error(`getUsersWithList Error ${error.message}`);
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

export async function deleteUserByEmail(email: string, adminEmail: string): Promise<void> {
  await prisma.$transaction([
    prisma.audit.create({
      data: {
        auditEvent: AuditEvent.USER_DELETED,
        type: "list",
        jsonData: {
          deletedUser: email,
          deletedBy: adminEmail,
        },
      },
    }),
    prisma.user.delete({
      where: {
        email,
      },
    }),
  ]);

  logger.info(`Deleted user ${email}`);
}

export async function createUserFromEmail(email: string) {
  return await prisma.user.create({
    data: {
      email,
      jsonData: {
        roles: [],
      },
    },
  });
}

export async function checkUserExists(email: string) {
  const res = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return res as User;
}
