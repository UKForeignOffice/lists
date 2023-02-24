import { List } from "@prisma/client";
import { logger } from "server/services/logger";
import { ListJsonData, ScheduledProcessKeyDates } from "server/models/types";
import { differenceInWeeks, eachWeekOfInterval, parseISO, startOfDay, startOfToday } from "date-fns";

export function legacyFindReminderToSend(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  const unpublishDate = startOfDay(parseISO(unpublished.UNPUBLISH));
  const today = startOfToday();
  // @ts-ignore
  const weeksUntilUnpublish = differenceInWeeks(unpublishDate, today, { roundingMethod: "ceil" });
  /**
   * Need to round up to get the start of the window (closest to the start date).
   * e.g.
   * weeksUntilUnpublish is 2 weeks and 2 days.
   * You need to ADD 5 days to get 3 weeks week before unpublish (the start of the window).
   */

  const weeksBeforeUnpublishToScheduledDates: { [n: number]: string } = {
    5: unpublished.PROVIDER_FIVE_WEEKS, // MINUS 5 weeks from end date,  but plus 1 week form start date
    4: unpublished.PROVIDER_FOUR_WEEKS, // MINUS 4 weeks from end date,  but plus 2 week form start date
    3: unpublished.PROVIDER_THREE_WEEKS, // MINUS 3 weeks from end date,  but plus 3 week form start date
    2: unpublished.PROVIDER_TWO_WEEKS,
    1: unpublished.ONE_WEEK,
    0: unpublished.UNPUBLISH,
  };

  const reminderToFind = weeksBeforeUnpublishToScheduledDates[weeksUntilUnpublish];

  log.debug(
    `looking for list items to send unpublish provider reminder at ${weeksUntilUnpublish} weeks (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind, weeksUntilUnpublish };
}

function newUnpublishedObject(startISO: string, unpublishISO: string) {
  const startDate = startOfDay(parseISO(startISO));
  const unpublishDate = startOfDay(parseISO(unpublishISO));
  /**
   * Looks like an "inverse" of keyDates.unpublished
   *     {
   *       '0': 2023-02-01T00:00:00.000Z,
   *       '1': 2023-02-08T00:00:00.000Z, plus 1 week from start date
   *       '2': 2023-02-15T00:00:00.000Z, plus 2 week from stat date
   *     }
   */
  return eachWeekOfInterval(
    {
      start: startDate,
      end: unpublishDate,
    },
    {
      // @ts-ignore
      weekStartsOn: startDate.getDay()!,
    }
  ).reduce((previousValue, currentValue, currentIndex) => {
    return {
      ...previousValue,
      [Number(currentIndex)]: currentValue.toISOString(),
    };
  }, {}) as ScheduledProcessKeyDates;
}

export function findReminderToSend(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  const today = startOfToday();
  const startDate = startOfDay(parseISO(keyDates.annualReview.START));

  // @ts-ignore
  const weeksSinceStartDate = differenceInWeeks(today, startDate, { roundingMethod: "floor" });
  /**
   * always round DOWN. e.g. if it is 2 weeks and 2 days, round down to 2 weeks (start of the window).
   * this algo always looks in normal time progression (always looking forwards).
   */
  const weeksToScheduledDates = newUnpublishedObject(keyDates.annualReview.START, unpublished.UNPUBLISH);

  const reminderToFind = weeksToScheduledDates[weeksSinceStartDate];

  log.debug(
    `looking for list items to send unpublish provider reminder at ${weeksSinceStartDate} weeks (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind, weeksSinceStartDate };
}
