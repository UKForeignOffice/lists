import { List } from "@prisma/client";
import { logger } from "server/services/logger";
import { ListJsonData } from "server/models/types";
import { addWeeks, differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";

export function findReminderToSend(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });
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

  log.debug(
    `looking for list items to send unpublish provider reminder at ${weeksSinceStartDate} weeks (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind, weeksSinceStartDate };
}
