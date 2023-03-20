import { PrismaClient } from "@prisma/client";
import { logger } from "scheduler/logger";
import { addYears } from "date-fns";

export const prisma = new PrismaClient();

export interface ListWithFirstPublishedDate {
  listId: number;
  oneYearAfterFirstPublishedDate: Date;
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
    const result = await prisma.list.findMany({
      where: {
        nextAnnualReviewStartDate: null,
      },
      select: {
        items: {
          where: {
            history: {
              some: {
                type: "PUBLISHED",
                time: {
                  gt: addYears(new Date(), -1).toISOString(),
                },
              },
            },
          },
          include: {
            history: true,
            list: true,
          },
        },
      },
    });

    logger.debug(`${result.length} lists without nextAnnualReview found`);
    return result;
  } catch (error) {
    logger.error(`findListsWithoutNextAnnualReview Error: ${(error as Error).message}`);
    return { error: new Error("Unable to get lists in annual review") };
  }
}
