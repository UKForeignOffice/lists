import { List } from "@prisma/client";
import { schedulerLogger } from "scheduler/logger";
import { ListJsonData } from "server/models/types";
import { parseISO } from "date-fns";

export function findReminderToSend(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findReminderToSend" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const unpublishDate = parseISO(keyDates.unpublished.UNPUBLISH);

  const reminderToFind = unpublishDate.toISOString();

  logger.debug(
    `looking for list items to send unpublish provider reminder at 0 days until unpublish date (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind };
}
