import { List } from "@prisma/client";
import { schedulerLogger } from "scheduler/logger";
import { ListJsonData } from "server/models/types";
import {  parseISO, startOfDay, subDays} from "date-fns";

export function findReminderToSend(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  // const today = startOfToday();
  const unpublishDate = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH));

  // // @ts-ignore
  // const daysUntilUnpublish = differenceInDays(today, unpublishDate, { roundingMethod: "floor" });
  // /**
  //  * always round DOWN. e.g. if it is 2 weeks and 2 days, round down to 2 weeks (start of the window)
  //  * to check for the presence or absence of a reminder for this "window".
  //  */

  const reminderToFind = subDays(unpublishDate, 1).toISOString();

  logger.debug(
    `looking for list items to send unpublish provider reminder at 1 day until unpublish date (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind };
}
