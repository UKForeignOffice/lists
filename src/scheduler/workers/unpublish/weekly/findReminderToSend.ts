import { List } from "@prisma/client";
import { schedulerLogger } from "scheduler/logger";
import { ListJsonData } from "server/models/types";
import { addWeeks, differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";

export function findReminderToSend(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList", timeframe: "weekly" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const today = startOfToday();
  const startDate = startOfDay(parseISO(keyDates.annualReview.START));

  // @ts-ignore
  const weeksSinceStartDate = differenceInWeeks(today, startDate, { roundingMethod: "floor" });
  /**
   * always round DOWN. e.g. if it is 2 weeks and 2 days, round down to 2 weeks (start of the window)
   * to check for the presence or absence of a reminder for this "window".
   */

  const reminderToFind = addWeeks(startDate, weeksSinceStartDate).toISOString();

  logger.debug(
    `looking for list items to send unpublish provider reminder at ${weeksSinceStartDate} weeks after start date (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind, weeksSinceStartDate };
}
