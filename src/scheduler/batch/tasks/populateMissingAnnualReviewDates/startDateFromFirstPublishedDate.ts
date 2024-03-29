import { addDays, addYears, isBefore, startOfDay, startOfToday } from "date-fns";
import { logger } from "scheduler/logger";
import { schedulerMilestoneDays } from "scheduler/batch/helpers";

const MONTH_WITH_ONE_DAY_BUFFER = schedulerMilestoneDays.post.ONE_MONTH + 1;

export function startDateFromFirstPublishedDate(firstPublished: Date, listId: number) {
  const proposedDate = startOfDay(addYears(firstPublished, 1));
  const minDate = addDays(startOfToday(), MONTH_WITH_ONE_DAY_BUFFER);

  const proposedDateIsWithinAMonth = isBefore(proposedDate, minDate);

  const startDate = proposedDateIsWithinAMonth ? minDate : proposedDate;

  if (proposedDateIsWithinAMonth) {
    logger.info(
      `listId: ${listId} has firstPublished date of ${firstPublished.toISOString()}. Proposed date (${startDate.toISOString()}) is within 29 days from today, setting ${minDate.toISOString()} instead`
    );
  }

  return startDate;
}
