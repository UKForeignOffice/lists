import { PrismaClient } from "@prisma/client";
import { logger } from "scheduler/logger";
import type { List } from "server/models/types";

export const prisma = new PrismaClient();

export interface ListWithFirstPublishedDate {
  listId: number;
  oneYearAfterFirstPublishedDate: Date;
}

export async function findFirstPublishedDateForList(listId: number) {
  return await prisma.event.findFirst({
    where: {
      listItem: {
        listId,
      },
      type: "PUBLISHED",
    },
    orderBy: {
      time: "asc",
    },
  });
}

export async function addAnnualReviewToList({ listId, oneYearAfterFirstPublishedDate }: ListWithFirstPublishedDate) {
  return await prisma.list.update({
    where: {
      id: listId,
    },
    data: {
      nextAnnualReviewStartDate: oneYearAfterFirstPublishedDate,
    },
  });
}

export async function findListsWithoutNextAnnualReview() {
  try {
    const result = (await prisma.list.findMany({
      where: {
        nextAnnualReviewStartDate: null,
      },
      include: {
        country: true,
      },
    })) as List[];

    logger.debug(`${result.length} lists without nextAnnualReview found`);
    return result;
  } catch (error) {
    logger.error(`findListsWithoutNextAnnualReview Error: ${(error as Error).message}`);
    return { error: new Error("Unable to get lists in annual review") };
  }
}
