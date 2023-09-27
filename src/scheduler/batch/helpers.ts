import { addWeeks, startOfDay, subDays, subWeeks } from "date-fns";
import type { ListAnnualReviewPostReminderType, ScheduledProcessKeyDates } from "server/models/types";

export const schedulerMilestoneDays = {
  post: {
    ONE_MONTH: 28,
    ONE_WEEK: 7,
    ONE_DAY: 1,
  },
  provider: {
    SIX_WEEKS: 42,
    FIVE_WEEKS: 35,
    FOUR_WEEKS: 28,
    THREE_WEEKS: 21,
    TWO_WEEKS: 14,
    ONE_WEEK: 7,
    ONE_DAY: 1,
  },
  both: {
    ONE_WEEK: 7,
    ONE_DAY: 1,
    START: 0,
    UNPUBLISH: 0,
  },
};

export type SchedulerMilestone =
  | typeof schedulerMilestoneDays.post.ONE_MONTH
  | typeof schedulerMilestoneDays.post.ONE_DAY
  | typeof schedulerMilestoneDays.both.START
  | typeof schedulerMilestoneDays.provider.FIVE_WEEKS
  | typeof schedulerMilestoneDays.provider.FOUR_WEEKS
  | typeof schedulerMilestoneDays.provider.THREE_WEEKS
  | typeof schedulerMilestoneDays.provider.TWO_WEEKS
  | typeof schedulerMilestoneDays.both.ONE_WEEK
  | typeof schedulerMilestoneDays.both.ONE_DAY
  | typeof schedulerMilestoneDays.both.UNPUBLISH;

export type RemindersBeforeStartDate = Exclude<ListAnnualReviewPostReminderType, "oneDayBeforeUnpublish">;

/**
 * @throws {Error} will throw a date-fns error if days could not be calculated
 */
export function composeKeyDatesForDate(date: Date) {
  const startDate = startOfDay(date);
  const endDate = addWeeks(startDate, 6);
  const keyDates: ScheduledProcessKeyDates = {
    annualReview: {
      POST_ONE_DAY: subDays(startDate, 1).toISOString(),
      POST_ONE_MONTH: subWeeks(startDate, 4).toISOString(),
      POST_ONE_WEEK: subWeeks(startDate, 1).toISOString(),
      START: startDate.toISOString(),
    },
    unpublished: {
      ONE_DAY: subDays(endDate, 1).toISOString(),
      ONE_WEEK: subWeeks(endDate, 1).toISOString(),
      PROVIDER_FIVE_WEEKS: subWeeks(endDate, 5).toISOString(),
      PROVIDER_FOUR_WEEKS: subWeeks(endDate, 4).toISOString(),
      PROVIDER_THREE_WEEKS: subWeeks(endDate, 3).toISOString(),
      PROVIDER_TWO_WEEKS: subWeeks(endDate, 2).toISOString(),
      UNPUBLISH: endDate.toISOString(),
    },
  };
  return keyDates;
}
