import { Event, ListItem, ListItemEvent, Prisma, Status } from "@prisma/client";
import { ActivityStatusViewModel, IndexListItem } from "server/models/listItem/types";
import * as DateFns from "date-fns";
import { isAfter, isBefore } from "date-fns";
import { ListWithJsonData } from "server/components/dashboard/helpers";

export const statusToActivityVM: Record<Status, ActivityStatusViewModel> = {
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
export function displayOneMonthAnnualReviewWarning(list: ListWithJsonData): boolean {
  const oneMonthBeforeDateString = list.jsonData.currentAnnualReview?.keyDates.annualReview.POST_ONE_MONTH;
  const annualReviewDateString = list.jsonData.currentAnnualReview?.keyDates.annualReview.START;
  let oneMonthWarning = false;

  if (oneMonthBeforeDateString && annualReviewDateString) {
    const oneMonthBeforeDate = new Date(list.jsonData.currentAnnualReview?.keyDates.annualReview.POST_ONE_MONTH as string);
    const isAfterOneMonthDate = isAfter(Date.now(), oneMonthBeforeDate);
    const annualReviewDate = new Date(list.jsonData.currentAnnualReview?.keyDates.annualReview.START as string);
    const isBeforeAnnualReviewDate = isBefore(Date.now(), annualReviewDate);
    oneMonthWarning = isAfterOneMonthDate && isBeforeAnnualReviewDate;
  }
  return oneMonthWarning;
}

/**
 * Used to display the warning banner in the list items page to notify that there are list items where the providers
 * have not responded AND the current date is five weeks or less prior to the unpublish date. Providers that haven't
 * responded can be determined where listItem.isAnnualReview = true and the listItem.status = OUT_WITH_PROVIDER.
 * @param list
 * @param listItems
 */
export function displayUnpublishWarning(list: ListWithJsonData, listItems: IndexListItem[]) {
  let display = false;
  let countOfListItems = 0;
  const fiveWeeksBeforeUnpublishDateString = list.jsonData.currentAnnualReview?.keyDates.unpublished.PROVIDER_FIVE_WEEKS;
  if (fiveWeeksBeforeUnpublishDateString) {
    const fiveWeeksBeforeUnpublishDate = new Date(fiveWeeksBeforeUnpublishDateString);
    const isAfterFiveWeeksBeforeUnpublishDate = isAfter(Date.now(), fiveWeeksBeforeUnpublishDate);
    if (isAfterFiveWeeksBeforeUnpublishDate) {
      const listItemsToBeUnpublished = listItems.filter((listItem) => {
        return listItem.isAnnualReview && listItem.status === Status.OUT_WITH_PROVIDER;
      });
      countOfListItems = listItemsToBeUnpublished.length;
      display = countOfListItems > 0;
    }
  }
  return {
    display,
    countOfListItems,
  };
}

/**
 * Used to display the warning banner in the list items page to notify the annual review email has been sent to the
 * providers. Only returns true if there are Event records for this list item with an event type "ANNUAL_REVIEW_STARTED"
 * and where the event time is after the annual review start date. This ensures Event records from previous years do not
 * get used when performing this validation.
 * @param events
 * @param list
 */
export function annualReviewEmailsSent(events: Array<{ type: string; time: Date }> | undefined, list: ListWithJsonData): boolean {
  if (!events || events.length === 0) return false;
  const annualReviewStartDateString = list?.jsonData?.currentAnnualReview?.keyDates.annualReview.START;

  if (!annualReviewStartDateString) return false;
  const annualReviewDate = new Date(annualReviewStartDateString);

  return events.some((event) => {
    return event.type === "ANNUAL_REVIEW_STARTED" &&
      isAfter(event.time, annualReviewDate);
  });
}
