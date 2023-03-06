import { prisma } from "server/models/db/prisma-client";
import { schedulerLogger } from "scheduler/logger";
import { List } from "@prisma/client";
import { findReminderToSend } from "../findReminderToSend";

export async function findListItemsToResetAnnualReview(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const { reminderToFind } = findReminderToSend(list);

  const listItems = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      isAnnualReview: true,
      status: "OUT_WITH_PROVIDER",
    },
  });

  logger.info(
    `Found ${listItems.length} items to send unpublish reminder ${
      listItems.length === 0
        ? `(already sent for period starting >= ${reminderToFind})`
        : [listItems.map((listItem) => listItem.id)]
    }`
  );

  return listItems;
}
