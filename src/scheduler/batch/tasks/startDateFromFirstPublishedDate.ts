import { addDays, addYears, formatISO, isBefore, startOfDay, startOfToday } from "date-fns";
import { logger } from "scheduler/logger";

export function startDateFromFirstPublishedDate(firstPublished: Date, listId: number) {
  const proposedDate = startOfDay(addYears(firstPublished, 1));
  const minDate = addDays(startOfToday(), 29);

  const proposedDateIsWithinAMonth = isBefore(proposedDate, minDate);

  const startDate = proposedDateIsWithinAMonth ? minDate : startOfDay(proposedDate);
  const truncatedStartDateISOString = formatISO(startDate, { representation: "date" });

  if (proposedDateIsWithinAMonth) {
    logger.info(
      `listId: ${listId} has firstPublished date of ${firstPublished.toISOString()}. Proposed date (${truncatedStartDateISOString}) is within 29 days from today, setting ${minDate.toISOString()} instead`
    );
  }

  return truncatedStartDateISOString;
}
