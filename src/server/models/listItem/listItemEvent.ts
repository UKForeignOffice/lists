import type { Prisma } from "@prisma/client";
import { ListItemEvent } from "@prisma/client";
import type { SendEmailResponse } from "notifications-node-client";

export type EventCreate<E extends ListItemEvent> = Prisma.EventCreateWithoutListItemInput & { type: E };

interface AnnualReviewAdditionalInfo {
  reference: string;
}

interface PostEditedAdditionalInfo {
  isPostEdit: boolean;
  userId: number;
  note: string;
}

type AdditionalEditedInfo = AnnualReviewAdditionalInfo | PostEditedAdditionalInfo;

/**
 * These are intended to be used during a nested write via Prisma.EventCreateWithoutListItemInput.
 * You do not need to pass "connect" or "date". Connections are done automatically when doing a nested write.
 * Date is now a defaulted field.
 */
export const EVENTS = {
  // Completely new form
  [ListItemEvent.NEW]: (): EventCreate<"NEW"> => ({
    type: ListItemEvent.NEW,
    jsonData: {
      eventName: "new",
    },
  }),

  [ListItemEvent.PUBLISHED]: (userId: number): EventCreate<"PUBLISHED"> => ({
    type: ListItemEvent.PUBLISHED,
    jsonData: {
      eventName: "publish",
      userId,
    },
  }),

  [ListItemEvent.ARCHIVED]: (userId: number, reason: string): EventCreate<"ARCHIVED"> => ({
    type: ListItemEvent.ARCHIVED,
    jsonData: {
      eventName: "archived",
      userId,
      reason,
    },
  }),

  [ListItemEvent.UNPUBLISHED]: (userId?: number, reference?: string): EventCreate<"UNPUBLISHED"> => ({
    type: ListItemEvent.UNPUBLISHED,
    jsonData: {
      eventName: "unpublish",
      ...(userId && { userId }),
      ...(reference && { reference }),
    },
  }),

  [ListItemEvent.PINNED]: (userId: number): EventCreate<"PINNED"> => ({
    type: ListItemEvent.PINNED,
    jsonData: {
      eventName: "pin",
      userId,
    },
  }),

  [ListItemEvent.UNPINNED]: (userId: number): EventCreate<"UNPINNED"> => {
    return {
      type: ListItemEvent.UNPINNED,
      jsonData: {
        eventName: "unpin",
        userId,
      },
    };
  },

  [ListItemEvent.DELETED]: (userId?: number, id?: number): EventCreate<"DELETED"> => ({
    type: ListItemEvent.DELETED,
    ...(id && { listItemId: id }),
    jsonData: {
      eventName: "deleted",
      ...(userId && { userId }),
    },
  }),

  /**
   * After post requests a change.
   */
  [ListItemEvent.OUT_WITH_PROVIDER]: (
    userId: number,
    requestedChanges: string,
    reference?: string
  ): EventCreate<"OUT_WITH_PROVIDER"> => ({
    type: ListItemEvent.OUT_WITH_PROVIDER,
    jsonData: {
      eventName: "requestChange",
      userId,
      requestedChanges,
      ...{ reference },
    },
  }),

  /**
   * After the provider makes the change
   */
  [ListItemEvent.EDITED]: (updatedJsonData = {}, options?: AdditionalEditedInfo): EventCreate<"EDITED"> => {
    let extraData = {};
    const DEFAULT_MESSAGE = "provider resubmitted with these updates";

    if (options) {
      const isPostEdit = "isPostEdit" in options;
      extraData = isPostEdit
        ? { isPostEdit: options.isPostEdit, userId: options.userId, notes: [options.note] }
        : { reference: options.reference, notes: [] };
    }

    return {
      type: ListItemEvent.EDITED,
      jsonData: {
        notes: [DEFAULT_MESSAGE], // will be overwritten by extraData if extraData.notes is present.
        eventName: "edited",
        updatedJsonData,
        ...extraData,
      },
    };
  },

  [ListItemEvent.CHECK_ANNUAL_REVIEW]: (
    updatedJsonData = {},
    reference?: string
  ): EventCreate<"CHECK_ANNUAL_REVIEW"> => ({
    type: ListItemEvent.CHECK_ANNUAL_REVIEW,
    jsonData: {
      notes: ["user submitted annual review with these updates"],
      eventName: "check annual review",
      updatedJsonData,
      ...{ reference },
    },
  }),

  [ListItemEvent.ANNUAL_REVIEW_STARTED]: (reference?: string): EventCreate<"ANNUAL_REVIEW_STARTED"> => ({
    type: ListItemEvent.ANNUAL_REVIEW_STARTED,
    jsonData: {
      eventName: "annual review started",
      ...{ reference },
    },
  }),

  [ListItemEvent.REMINDER]: (
    response: SendEmailResponse,
    notes?: string[],
    reference?: string
  ): EventCreate<"REMINDER"> => {
    const notifyResponseWithoutContent = {
      id: response.id,
      template: response.template,
    };

    return {
      type: ListItemEvent.REMINDER,
      // @ts-ignore -- issue is with response.Template, there is a tsc/prisma incompatibility
      jsonData: {
        eventName: "reminder",
        ...{ notes },
        ...{ reference },
        response: notifyResponseWithoutContent,
      },
    };
  },

  [ListItemEvent.ANNUAL_REVIEW_OVERDUE]: (reference?: string): EventCreate<"ANNUAL_REVIEW_OVERDUE"> => ({
    type: ListItemEvent.ANNUAL_REVIEW_OVERDUE,
    jsonData: {
      eventName: "annual review overdue",
      ...{ reference },
    },
  }),
};
