import { PrismaClient } from "@prisma/client";
import { logger } from "scheduler/logger";
import type { List, CurrentAnnualReview, ListUpdateInput, ListJsonData } from "server/models/types";
import type { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { addDays } from "date-fns";

export const prisma = new PrismaClient();

export interface ListWithFirstPublishedDate {
  listId: number;
  oneYearAfterFirstPublishedDate: Date | string;
}

interface FormattedList {
  id: number;
  items: ListItemWithHistory[];
  jsonData: ListJsonData;
  nextAnnualReviewStartDate: Date | null;
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

export async function findEligibleListItems() {
  try {
    // @ts-ignore
    const result: FormattedList[] = await prisma.list.findMany({
      where: {
        nextAnnualReviewStartDate: {
          lte: addDays(new Date(), 28),
        },
      },
      select: {
        items: {
          where: {
            ...{ status: { in: ["PUBLISHED", "CHECK_ANNUAL_REVIEW"] } },
            history: {
              some: {
                type: "PUBLISHED",
                time: {
                  lte: addDays(new Date(), 28),
                },
              },
            },
          },
          include: {
            history: {
              orderBy: {
                time: "desc",
              },
            },
          },
        },
        id: true,
        jsonData: true,
        nextAnnualReviewStartDate: true,
      },
    });
    return { result };
  } catch (error) {
    logger.error(`findListItemsForLists Error ${(error as Error).stack}`);
    return { error: Error("Unable to get list items") };
  }
}

export async function updateListForAnnualReview(
  list: FormattedList,
  listData: {
    currentAnnualReview?: CurrentAnnualReview;
  }
): Promise<Result<List>> {
  try {
    const data: ListUpdateInput = {
      jsonData: {
        ...list.jsonData,
        currentAnnualReview: listData.currentAnnualReview,
      },
    };

    const result = (await prisma.list.update({
      where: {
        id: list.id,
      },
      data,
    })) as List;
    return { result };
  } catch (error) {
    const errorMessage = `Unable to update list for annual review: ${(error as Error).message}`;
    logger.error(errorMessage);
    return { error: new Error(errorMessage) };
  }
}
