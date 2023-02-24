import { List } from "@prisma/client";
import { logger } from "server/services/logger";
import { ListJsonData } from "server/models/types";
import { differenceInWeeks, parseISO, startOfDay, startOfToday, startOfWeek } from "date-fns";

export function findReminderToSend(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });
  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  const unpublishDate = startOfDay(parseISO(unpublished.UNPUBLISH));
  const startDate = startOfDay(parseISO(keyDates.annualReview.START));
  log.info(`unpublish date ${unpublished.UNPUBLISH}`);
  const today = startOfToday();
  // @ts-ignore
  const week = startOfWeek(today, { weekStartsOn: startDate.getDay() });
  const weeksUntilUnpublish = differenceInWeeks(unpublishDate, today, { roundingMethod: "floor" });

  const weeksBeforeUnpublishToQuery: { [n: number]: string } = {
    5: unpublished.PROVIDER_FIVE_WEEKS,
    4: unpublished.PROVIDER_FOUR_WEEKS,
    3: unpublished.PROVIDER_THREE_WEEKS,
    2: unpublished.PROVIDER_TWO_WEEKS,
    1: unpublished.ONE_WEEK,
    0: unpublished.UNPUBLISH,
  };

  const reminderToFind = weeksBeforeUnpublishToQuery[weeksUntilUnpublish];

  log.debug(
    `looking for list items to send unpublish provider reminder at ${weeksUntilUnpublish} weeks (No reminder events sent >= ${reminderToFind})`
  );

  return { reminderToFind, weeksUntilUnpublish };
}
