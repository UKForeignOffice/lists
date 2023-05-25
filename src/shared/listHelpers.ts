import { subMonths } from "date-fns";
import { Status } from "@prisma/client";
import type { Prisma, ListItemEvent, AuditEvent } from "@prisma/client";
import type { Logger } from "winston";
import { prisma } from "scheduler/prismaClient";
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
  logger: Logger;
}) {
  try {
    const { listIds, listItemIds, statuses, isAnnualReview, logger } = options;
    if (!listIds?.length && !listItemIds?.length) {
      const message = "List ids or list item ids must be specified to find list items";
      logger.error(message);
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
    options.logger.error(`findListItemsForLists Error ${(error as Error).stack}`);
    return { error: Error("Unable to get list items") };
  }
}

export async function updateListForAnnualReview(
  list: List,
  listData: {
    currentAnnualReview?: CurrentAnnualReview;
  },
  logger: Logger
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

export async function findListByAnnualReviewDate(annualReviewStartDate: Date, logger: Logger): Promise<Result<List[]>> {
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
    logger.error(`findListByCountryAndType Error: ${(error as Error).message}`);
    return { error: Error("Unable to get lists") };
  }
}

export async function findListsWithCurrentAnnualReview(logger: Logger): Promise<Result<List[]>> {
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
    logger.error(`findListsInAnnualReview Error: ${(error as Error).message}`);
    return { error: new Error("Unable to get lists in annual review") };
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
  eventName: AuditListItemEventName,
  auditEvent: AuditEvent,
  logger: Logger
): Promise<Result<ListItemWithHistory[]>> {
  const updatedListItems: ListItemWithHistory[] = [];

  if (!listItems?.length) {
    const message = `List item ids must be provided to update list items for list ${list.id}`;
    logger.error(message);
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
        // history: EVENTS[listItemEvent](),
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
      const message = `could not update list item ${listItem.id} due to ${err.message}.`;
      logger.error(message);
    }
  }
  return { result: updatedListItems };
}
