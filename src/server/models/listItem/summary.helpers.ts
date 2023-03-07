import { Event, ListItem, ListItemEvent, Prisma, Status } from "@prisma/client";
import { ActivityStatusViewModel, AnnualReviewBanner, IndexListItem } from "server/models/listItem/types";
import * as DateFns from "date-fns";
import { differenceInWeeks, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { ListWithJsonData } from "server/components/dashboard/helpers";
import { prisma } from "server/models/db/prisma-client";

/**
 * Additions to Status type to help with rendering
 */
export type AdditionalStatus = "OUT_FOR_ANNUAL_REVIEW";

export const statusToActivityVM: Record<Status | AdditionalStatus, ActivityStatusViewModel> = {
  NEW: {
    type: "to_do",
    text: "Check new entry",
  },
  OUT_WITH_PROVIDER: {
    type: "out_with_provider",
    text: "Edits requested",
  },
  EDITED: {
    text: "Check edits",
    type: "to_do",
  },
  CHECK_ANNUAL_REVIEW: {
    text: "Check annual review",
    type: "to_do",
  },
  ANNUAL_REVIEW_OVERDUE: {
    text: "Annual review overdue",
    type: "out_with_provider",
  },
  PUBLISHED: {
    text: "No action needed",
    type: "no_action_needed",
  },
  UNPUBLISHED: {
    text: "Removed by post",
    type: "to_do",
    colour: "red",
  },
  OUT_FOR_ANNUAL_REVIEW: {
    type: "out_with_provider",
    text: "Out for annual review",
  },
};

export enum PUBLISHING_STATUS {
  new = "new",
  live = "live",
  unpublished = "unpublished",
  archived = "archived",
}

export type ListItemWithHistory = ListItem & {
  history: Event[];
};

/**
 * The prisma query must be called with
 * history: {
 *   orderBy: {
 *     time: 'desc',
 *   }
 * },
 * These functions do not do any additional sorting.
 */
export function newestEventOfTypeIndex(history: Event[], type: ListItemEvent): number {
  return history.findIndex((event) => event.type === type);
}

export function hasBeenUnpublishedSincePublishing(history: Event[]): boolean {
  const newestPublishEvent = newestEventOfTypeIndex(history, ListItemEvent.PUBLISHED);
  const newestUnpublishEvent = newestEventOfTypeIndex(history, ListItemEvent.UNPUBLISHED);
  const hasUnpublishEvent = newestUnpublishEvent !== -1;
  const hasPublishEvent = newestPublishEvent !== -1;

  if (!hasPublishEvent && hasUnpublishEvent) {
    return true;
  }

  return hasUnpublishEvent && newestUnpublishEvent < newestPublishEvent;
}

export function hasBeenPublishedSinceUnpublishing(history: Event[]): boolean {
  const newestPublishEvent = newestEventOfTypeIndex(history, ListItemEvent.PUBLISHED);
  const newestUnpublishEvent = newestEventOfTypeIndex(history, ListItemEvent.UNPUBLISHED);
  const hasUnpublishEvent = newestUnpublishEvent !== -1;
  const hasPublishEvent = newestPublishEvent !== -1;

  if (!hasUnpublishEvent && hasPublishEvent) {
    return true;
  }
  return hasPublishEvent && newestPublishEvent < newestUnpublishEvent;
}

export function hasBeenArchived(history: Event[]) {
  return history.find((event) => event.type === "ARCHIVED");
}

export function getPublishingStatus(item: ListItemWithHistory): PUBLISHING_STATUS {
  if (hasBeenArchived(item.history)) {
    return PUBLISHING_STATUS.archived;
  }

  if (item.isPublished || hasBeenPublishedSinceUnpublishing(item.history)) {
    return PUBLISHING_STATUS.live;
  }

  if (hasBeenUnpublishedSincePublishing(item.history) || item.status === "UNPUBLISHED") {
    return PUBLISHING_STATUS.unpublished;
  }

  return PUBLISHING_STATUS.new;
}

export function wasUnpublishedByUser(history: Event[]): boolean {
  const event = history.find((event) => event.type === "UNPUBLISHED");
  const jsonData = event?.jsonData as Prisma.JsonObject;
  const userId = jsonData?.userId ?? false;
  return userId !== false;
}

export function getActivityStatus(item: ListItemWithHistory): ActivityStatusViewModel {
  const { history, status, isPublished } = item;

  if (status === "EDITED") {
    return statusToActivityVM.EDITED;
  }

  if (status === "OUT_WITH_PROVIDER" && item.isAnnualReview) {
    return statusToActivityVM.OUT_FOR_ANNUAL_REVIEW;
  }

  if (!isPublished) {
    if (status === "OUT_WITH_PROVIDER") {
      return statusToActivityVM.OUT_WITH_PROVIDER;
    }
    if (wasUnpublishedByUser(history)) {
      return statusToActivityVM.UNPUBLISHED;
    }
    if (status === "ANNUAL_REVIEW_OVERDUE") {
      return statusToActivityVM.ANNUAL_REVIEW_OVERDUE;
    }
  }

  return statusToActivityVM[status];
}

export function getLastPublished(events: Array<{ type: string; time: Date }> | undefined): string {
  if (!events || events.length === 0) return "Not applicable";

  const publishedEvents = events.filter((event) => event.type === "PUBLISHED");
  const sortedByDate = publishedEvents.sort((a, b) => a.time.getTime() - b.time.getTime());

  return sortedByDate.length > 0 ? DateFns.format(sortedByDate[0].time, "dd MMMM yyyy") : "Not applicable";
}

/**
 * Used to display the warning banner in the list items page to notify that the annual review is due to start within the
 * next month. This is determined where the current date is after the one month warning date and before the annual review
 * start date.
 * @param list
 */
export function displayOneMonthAnnualReviewWarning(
  list: ListWithJsonData
): AnnualReviewBanner<"oneMonthWarning", boolean> {
  const oneMonthBeforeDateString = list.jsonData.currentAnnualReview?.keyDates.annualReview.POST_ONE_MONTH;
  const annualReviewDateString = list.jsonData.currentAnnualReview?.keyDates.annualReview.START;
  let oneMonthWarning = false;

  if (oneMonthBeforeDateString && annualReviewDateString) {
    const oneMonthBeforeDate = new Date(
      list.jsonData.currentAnnualReview?.keyDates.annualReview.POST_ONE_MONTH as string
    );
    const isAfterOneMonthDate = isAfter(Date.now(), oneMonthBeforeDate);
    const annualReviewDate = new Date(list.jsonData.currentAnnualReview?.keyDates.annualReview.START as string);
    const isBeforeAnnualReviewDate = isBefore(Date.now(), annualReviewDate);
    oneMonthWarning = isAfterOneMonthDate && isBeforeAnnualReviewDate;
  }
  return {
    oneMonthWarning,
  };
}

/**
 * Used to display the warning banner in the list items page to notify that there are list items where the providers
 * have not responded AND the current date is five weeks or less prior to the unpublish date. Providers that haven't
 * responded can be determined where listItem.isAnnualReview = true and the listItem.status = OUT_WITH_PROVIDER.
 */
export async function displayUnpublishWarning(
  list: ListWithJsonData
): Promise<AnnualReviewBanner<"unpublishWarning", number>> {
  const keyDates = list.jsonData.currentAnnualReview?.keyDates;
  if (!keyDates) {
    return;
  }
  const startDate = startOfDay(parseISO(keyDates?.annualReview.START));
  const unpublishDate = startOfDay(parseISO(keyDates?.unpublished.UNPUBLISH));

  const weeksSinceStarting = differenceInWeeks(unpublishDate, startDate, { roundingMethod: "floor" });
  const countOfListItems = await countNumberOfNonRespondents(list.id!, startDate);

  if (weeksSinceStarting >= 5 && countOfListItems > 0) {
    return {
      unpublishWarning: countOfListItems,
    };
  }
}

async function countNumberOfNonRespondents(listId: number, annualReviewStartDate: string | Date) {
  return await prisma.listItem.count({
    where: {
      listId,
      status: "OUT_WITH_PROVIDER",
      history: {
        none: {
          type: "EDITED",
          time: {
            gte: annualReviewStartDate,
          },
        },
      },
    },
  });
}

export function displayEmailsSentBanner(
  list: ListWithJsonData,
  listItems: IndexListItem[]
): AnnualReviewBanner<"emailsSent", boolean> {
  const emailsSent = listItems?.some((listItem) => {
    return annualReviewEmailsSent(list, listItem?.history);
  });

  if (!emailsSent) return;

  return {
    emailsSent,
  };
}

/**
 * Used to display the warning banner in the list items page to notify the annual review email has been sent to the
 * providers. Only returns true if there are Event records for this list item with an event type "ANNUAL_REVIEW_STARTED"
 * and where the event time is after the annual review start date. This ensures Event records from previous years do not
 * get used when performing this validation.
 */
export function annualReviewEmailsSent(
  list: ListWithJsonData,
  events?: Array<{ type: string; time: Date }> | undefined
): boolean {
  if (!events?.length) return false;
  const annualReviewStartDateString = list?.jsonData?.currentAnnualReview?.keyDates.annualReview.START;

  if (!annualReviewStartDateString) return false;
  const annualReviewDate = new Date(annualReviewStartDateString);

  return events.some((event) => {
    return event.type === "ANNUAL_REVIEW_STARTED" && isAfter(event.time, annualReviewDate);
  });
}
