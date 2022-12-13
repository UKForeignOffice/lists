import { parseDate } from "../helpers";
import { addDays, subDays } from "date-fns";
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
  | typeof schedulerMilestoneDays.provider.ONE_WEEK
  | typeof schedulerMilestoneDays.provider.ONE_DAY
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
function getUnpublishedDateContexts(todayDateString: string): DateContext[] {
  const today = parseDate(todayDateString);
  const unpublishedDateSixWeeksAway = addDays(today, schedulerMilestoneDays.provider.SIX_WEEKS);
  const unpublishedDateOneDayAway = subDays(unpublishedDateSixWeeksAway, 1);

  const unpublishedDateContextsForFiltering: DateContext[] = [
    {
      eventMilestone: schedulerMilestoneDays.provider.ONE_DAY,
      eventDate: unpublishedDateOneDayAway,
    },
    {
      eventMilestone: schedulerMilestoneDays.both.UNPUBLISH,
      eventDate: unpublishedDateSixWeeksAway,
    },
  ];

  // fill in the dates between 1 to 5 weeks from the todayDateString
  for (
    let daysBeforeEvent = schedulerMilestoneDays.provider.ONE_WEEK;
    daysBeforeEvent <= schedulerMilestoneDays.provider.FIVE_WEEKS;
    daysBeforeEvent += 7
  ) {
    const localUnpublishDate = subDays(unpublishedDateSixWeeksAway, daysBeforeEvent);
    const unpublishDate = new Date(
      Date.UTC(localUnpublishDate.getFullYear(), localUnpublishDate.getMonth(), localUnpublishDate.getDate(), 0, 0, 0)
    );

    const eventDate = new Date(
      Date.UTC(unpublishDate.getFullYear(), unpublishDate.getMonth(), unpublishDate.getDate(), 0, 0, 0)
    );

    unpublishedDateContextsForFiltering.push({
      eventDate,
      eventMilestone: daysBeforeEvent,
    });
  }
  return unpublishedDateContextsForFiltering;
}

function getAnnualReviewDateContexts(todayDateString: string): DateContext[] {
  const today = parseDate(todayDateString);
  const annualReviewStart = addDays(today, schedulerMilestoneDays.post.ONE_MONTH);

  const annualReview: DateContext[] = [
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_MONTH,
      eventDate: today,
    },
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_DAY,
      eventDate: subDays(annualReviewStart, schedulerMilestoneDays.post.ONE_DAY),
    },
    {
      eventMilestone: schedulerMilestoneDays.post.ONE_WEEK,
      eventDate: subDays(annualReviewStart, schedulerMilestoneDays.post.ONE_WEEK),
    },
    {
      eventMilestone: schedulerMilestoneDays.both.START,
      eventDate: annualReviewStart,
    },
  ];
  return annualReview;
}

export function getDateContexts(todayDateString: string): SchedulerDateContexts {
  return {
    annualReview: getAnnualReviewDateContexts(todayDateString),
    unpublish: getUnpublishedDateContexts(todayDateString),
  };
}

export function getCurrentAnnualReviewData(
  listItemIdsForAnnualReview: any[],
  contexts: SchedulerDateContexts
) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  const currentAnnualReview: CurrentAnnualReview = {
    reference: crypto.randomUUID(),
    eligibleListItems: listItemIdsForAnnualReview,
    keyDates: {
      annualReview: {
        POST_ONE_MONTH: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_MONTH
        ).eventDate.toLocaleDateString("en-gb", options),
        POST_ONE_WEEK: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_WEEK
        ).eventDate.toLocaleDateString("en-gb", options),
        POST_ONE_DAY: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.post.ONE_DAY
        ).eventDate.toLocaleDateString("en-gb", options),
        START: getDateForContext(
          contexts,
          "annualReview",
          schedulerMilestoneDays.both.START
        ).eventDate.toLocaleDateString("en-gb", options),
      },
      unpublished: {
        PROVIDER_FIVE_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.FIVE_WEEKS
        ).eventDate.toLocaleDateString("en-gb", options),
        PROVIDER_FOUR_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.FOUR_WEEKS
        ).eventDate.toLocaleDateString("en-gb", options),
        PROVIDER_THREE_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.THREE_WEEKS
        ).eventDate.toLocaleDateString("en-gb", options),
        PROVIDER_TWO_WEEKS: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.TWO_WEEKS
        ).eventDate.toLocaleDateString("en-gb", options),
        PROVIDER_ONE_WEEK: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.ONE_WEEK
        ).eventDate.toLocaleDateString("en-gb", options),
        ONE_DAY_UNTIL_UNPUBLISH: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.provider.ONE_DAY
        ).eventDate.toLocaleDateString("en-gb", options),
        UNPUBLISH: getDateForContext(
          contexts,
          "unpublish",
          schedulerMilestoneDays.both.UNPUBLISH
        ).eventDate.toLocaleDateString("en-gb", options),
      },
    },
  };
  return currentAnnualReview;
}

export function getDateForContext(
  contexts: SchedulerDateContexts,
  contextType: string,
  milestone: SchedulerMilestone
) {
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
