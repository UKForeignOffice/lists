import { Event, ListItem, ListItemEvent, Prisma, Status } from "@prisma/client";
import { ActivityStatusViewModel } from "server/models/listItem/types";

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
    if (wasUnpublishedByUser(history)) {
      return statusToActivityVM.UNPUBLISHED;
    }
    if (status === "ANNUAL_REVIEW_OVERDUE") {
      return statusToActivityVM.ANNUAL_REVIEW_OVERDUE;
    }
  }

  if (status === "PUBLISHED" && !item.isAnnualReview) {
    return statusToActivityVM.PUBLISHED;
  }

  return statusToActivityVM[status];
}
