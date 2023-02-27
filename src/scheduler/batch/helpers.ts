import { addDays, startOfDay, subDays } from "date-fns";
import { CurrentAnnualReview } from "server/models/types";
import crypto from "crypto";

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

export interface DateContext {
  eventMilestone: SchedulerMilestone;
  eventDate: Date;
}

export interface SchedulerDateContexts {
  annualReview: DateContext[];
  unpublish: DateContext[];
}

export type MilestoneTillAnnualReview = "START" | "POST_ONE_DAY" | "POST_ONE_WEEK" | "POST_ONE_MONTH";

/**
 * Calculate the annual review dates six weeks prior to the unpublish date of 0, 1, 7, 14, 21, 28, 35 days in the future
 * from the todayDateString.
 * @param todayDateString
 * @returns UnpublishedDateContext[]
 */
function getUnpublishedDateContexts(annualReviewStartDate: Date): DateContext[] {
  const unpublishedDateSixWeeksAway = addDays(annualReviewStartDate, schedulerMilestoneDays.provider.SIX_WEEKS);
  const unpublishedDateOneDayAway = subDays(unpublishedDateSixWeeksAway, 1);

  const unpublishedDateContextsForFiltering: DateContext[] = [
    {
      eventMilestone: schedulerMilestoneDays.both.ONE_DAY,
      eventDate: unpublishedDateOneDayAway,
    },
    {
      eventMilestone: schedulerMilestoneDays.both.UNPUBLISH,
      eventDate: unpublishedDateSixWeeksAway,
    },
  ];

  // fill in the dates between 1 to 5 weeks from the todayDateString
  // TODO:- refactor to use eachWeekOfInterval (see git 39e9155437946edfb6a879328656f7e5143b767b findReminderToSend.newUnpublishedObject.)
  // TODO:- investigate I [jen] don't think this is necessary anymore.
  for (
    let eventMilestone = schedulerMilestoneDays.both.ONE_WEEK;
    eventMilestone <= schedulerMilestoneDays.provider.FIVE_WEEKS;
    eventMilestone += 7
  ) {
    const eventDate = subDays(unpublishedDateSixWeeksAway, eventMilestone);
    const startOfEventDate = startOfDay(eventDate);
    unpublishedDateContextsForFiltering.push({
      eventDate: startOfEventDate,
      eventMilestone,
    });
  }
  return unpublishedDateContextsForFiltering;
}

function getAnnualReviewDateContexts(annualReviewStartDate: Date): DateContext[] {
  const annualReview: DateContext[] = [
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_MONTH,
      eventDate: subDays(annualReviewStartDate, schedulerMilestoneDays.post.ONE_MONTH),
    },
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_DAY,
      eventDate: subDays(annualReviewStartDate, schedulerMilestoneDays.post.ONE_DAY),
    },
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_WEEK,
      eventDate: subDays(annualReviewStartDate, schedulerMilestoneDays.post.ONE_WEEK),
    },
    {
      eventMilestone: schedulerMilestoneDays.both.START,
      eventDate: annualReviewStartDate,
    },
  ];
  return annualReview;
}

export function getDateContexts(annualReviewStartDate: Date): SchedulerDateContexts {
  return {
    annualReview: getAnnualReviewDateContexts(annualReviewStartDate),
    unpublish: getUnpublishedDateContexts(annualReviewStartDate),
  };
}

export function getCurrentAnnualReviewData(listItemIdsForAnnualReview: any[], contexts: SchedulerDateContexts) {
  const currentAnnualReview: CurrentAnnualReview = {
    reference: crypto.randomUUID(),
    eligibleListItems: listItemIdsForAnnualReview,
    keyDates: {
      annualReview: {
        POST_ONE_MONTH: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_MONTH
        ).eventDate.toISOString(),
        POST_ONE_WEEK: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_WEEK
        ).eventDate.toISOString(),
        POST_ONE_DAY: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_DAY
        ).eventDate.toISOString(),
        START: getDateForContext(contexts, "annualReview", schedulerMilestoneDays.both.START).eventDate.toISOString(),
      },
      unpublished: {
        PROVIDER_FIVE_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.FIVE_WEEKS
        ).eventDate.toISOString(),
        PROVIDER_FOUR_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.FOUR_WEEKS
        ).eventDate.toISOString(),
        PROVIDER_THREE_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.THREE_WEEKS
        ).eventDate.toISOString(),
        PROVIDER_TWO_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.TWO_WEEKS
        ).eventDate.toISOString(),
        ONE_WEEK: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.both.ONE_WEEK
        ).eventDate.toISOString(),
        ONE_DAY: getDateForContext(contexts, "unpublish", schedulerMilestoneDays.both.ONE_DAY).eventDate.toISOString(),
        UNPUBLISH: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.both.UNPUBLISH
        ).eventDate.toISOString(),
      },
    },
  };
  return currentAnnualReview;
}

export function getDateForContext(contexts: SchedulerDateContexts, contextType: string, milestone: SchedulerMilestone) {
  let dateContext;
  switch (contextType) {
    case "annualReview":
      dateContext = contexts.annualReview.find((context) => context.eventMilestone === milestone);
      break;
    case "unpublish":
      dateContext = contexts.unpublish.find((context) => context.eventMilestone === milestone);
      break;
  }
  if (!dateContext) {
    dateContext = { eventDate: new Date(), daysBeforeEvent: 0 };
  }
  return dateContext;
}
