import { List } from "@prisma/client";
import { schedulerLogger } from "scheduler/logger";
import { ListJsonData } from "server/models/types";
import {  parseISO, startOfDay} from "date-fns";

export function findReminderToSend(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const reminderToFind = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH)).toISOString();

  logger.debug(
    `looking for list items to send unpublish provider reminder at 1 day until unpublish date (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind };
}
