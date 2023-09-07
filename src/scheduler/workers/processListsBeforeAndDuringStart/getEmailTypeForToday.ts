import type { CurrentAnnualReview } from "shared/types";
import type { AnnualReviewKeyDates } from "server/models/types";
import { startOfToday } from "date-fns";
import type { RemindersBeforeStartDate } from "scheduler/batch/helpers";

/**
 * Determines which email should be sent based on today's date.
 */
export function getEmailTypeForToday(keyDates: CurrentAnnualReview["keyDates"]): RemindersBeforeStartDate | undefined {
  if (!keyDates?.annualReview) {
    return;
  }
  const keyDatesBeforeStart = keyDates.annualReview;

  /**
   * `POST_<INTERVAL_NAME>` refers to dates for emails to send to post (consular staff) before the start date
   * e.g. `POST_ONE_MONTH` - Email to send to consular staff one month before start date.
   */
  const parsedKeyDates: Record<keyof AnnualReviewKeyDates, Date> = {
    POST_ONE_MONTH: new Date(keyDatesBeforeStart.POST_ONE_MONTH),
    POST_ONE_WEEK: new Date(keyDatesBeforeStart.POST_ONE_WEEK),
    POST_ONE_DAY: new Date(keyDatesBeforeStart.POST_ONE_DAY),
    START: new Date(keyDatesBeforeStart.START),
  };

  const today = startOfToday();

  if (today >= parsedKeyDates.START) {
    return "started";
  }

  if (today >= parsedKeyDates.POST_ONE_DAY) {
    return "oneDayBeforeStart";
  }

  if (today >= parsedKeyDates.POST_ONE_WEEK) {
    return "oneWeekBeforeStart";
  }

  if (today >= parsedKeyDates.POST_ONE_MONTH) {
    return "oneMonthBeforeStart";
  }
}
