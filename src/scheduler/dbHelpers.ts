import { subMonths } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { logger } from "scheduler/logger";
import { Status } from "@prisma/client";

import type { Prisma, ListItemEvent } from "@prisma/client";
import type {
  List,
  CurrentAnnualReview,
  ListItemWithHistory,
  AuditListItemEventName,
  ListUpdateInput,
} from "shared/types";

export async function findListItems(options: {
  listIds?: number[];
  listItemIds?: number[];
  statuses?: Status[];
  isAnnualReview?: boolean;
}) {
  try {
    const { listIds, listItemIds, statuses, isAnnualReview } = options;
    if (!listIds?.length && !listItemIds?.length) {
      const message = "List ids or list item ids must be specified to find list items";
      logger.error(`findListItems: ${message}`);
      return { error: Error(message) };
    }
    const result = await prisma.listItem.findMany({
      where: {
        ...(listIds != null && { listId: { in: listIds } }),
        ...(listItemIds != null && { id: { in: listItemIds } }),
        ...(statuses != null && { status: { in: statuses } }),
        ...(isAnnualReview != null && { isAnnualReview }),
        history: {
          some: {
            type: "PUBLISHED",
            time: {
              lte: subMonths(Date.now(), 1),
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
    });
    return { result };
  } catch (error) {
    logger.error(`findListItems Error: ${(error as Error).message}`);
    return { error: Error("Unable to get list items") };
  }
}

export async function findListsWithCurrentAnnualReview(): Promise<Result<List[]>> {
  try {
    const result = (await prisma.list.findMany({
      where: {
        jsonData: {
          path: ["currentAnnualReview", "eligibleListItems"],
          not: "",
        },
      },
      include: {
        country: true,
      },
    })) as List[];

    logger.debug(`direct from query, found [${result.length}] lists`);
    return { result };
  } catch (error) {
    logger.error(
      `findListsWithCurrentAnnualReview: Unable to find list with current annual review ${(error as Error).message}`
    );
    return { error: new Error("Unable to get lists in annual review") };
  }
}

export async function updateListForAnnualReview(
  list: List,
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
    const errorMessage = `Unable to update list with id ${list.id} for annual review: ${(error as Error).message}`;
    logger.error(`updateListForAnnualReview: ${errorMessage}`);
    return { error: new Error(errorMessage) };
  }
}

export async function findListByAnnualReviewDate(annualReviewStartDate: Date): Promise<Result<List[]>> {
  try {
    logger.debug(`searching for lists matching date [${annualReviewStartDate}]`);

    const result = (await prisma.list.findMany({
      where: {
        nextAnnualReviewStartDate: {
          lte: annualReviewStartDate,
        },
      },
      include: {
        country: true,
        items: {
          where: {
            history: {
              some: {
                type: "PUBLISHED",
                time: {
                  lte: subMonths(Date.now(), 1),
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
      },
    })) as List[];

    logger.debug(`direct from query, found [${result.length}] lists`);

    return { result };
  } catch (error) {
    logger.error(
      `findListByAnnualReviewDate Error: Unable to find list by specified annual review date: ${annualReviewStartDate}  ${
        (error as Error).message
      }`
    );
    return { error: Error("Unable to get lists") };
  }
}

/**
 * Updates the isAnnualReview flag for list items and adds a ListItemEvent record.
 * @param listItems
 * @param status
 * @param eventName
 * @param auditEvent
 */
export async function updateIsAnnualReview(
  list: List,
  listItems: ListItemWithHistory[],
  listItemEvent: ListItemEvent,
  eventName: AuditListItemEventName
): Promise<Result<ListItemWithHistory[]>> {
  const updatedListItems: ListItemWithHistory[] = [];

  if (!listItems?.length) {
    const message = `List item ids must be provided to update list items for list with id ${list.id}`;
    logger.error(`updateIsAnnualReview: ${message}`);
    return { error: new Error(message) };
  }
  for (const listItem of listItems) {
    const updateListItemPrismaStatement: Prisma.ListItemUpdateArgs = {
      where: {
        id: listItem.id,
      },
      data: {
        isAnnualReview: listItem.status !== Status.UNPUBLISHED,
        status: Status.OUT_WITH_PROVIDER,
        history: {
          create: {
            type: listItemEvent,
            jsonData: {
              eventName: eventName,
              itemId: listItem.id,
            },
          },
        },
      },
    };
    try {
      logger.debug(`updating isAnnualReview for list item ${listItem.id}`);
      await prisma.listItem.update(updateListItemPrismaStatement);
      updatedListItems.push(listItem);
    } catch (err) {
      const message = `Could not update list item ${listItem.id} due to ${err.message}.`;
      logger.error(`updateIsAnnualReview: ${message}`);
    }
  }
  return { result: updatedListItems };
}
