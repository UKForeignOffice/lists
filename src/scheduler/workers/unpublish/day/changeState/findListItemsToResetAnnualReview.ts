import { prisma } from "shared/prisma";;
import { schedulerLogger } from "scheduler/logger";
import { List } from "@prisma/client";

export async function findListItemsToResetAnnualReview(list: List) {
  const logger = schedulerLogger.child({
    listId: list.id,
    method: "findListItemsToResetAnnualReview",
    timeframe: "day",
  });

  const listItems = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      isAnnualReview: true,
      status: "OUT_WITH_PROVIDER",
    },
  });

  logger.info(`Found ${listItems.length} items to unpublish (${listItems.map((listItem) => listItem.id)})`);
  return listItems;
}
