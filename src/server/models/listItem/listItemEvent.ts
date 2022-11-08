import { prisma } from "../db/prisma-client";
import {Prisma, ListItemEvent} from "@prisma/client";

import {
  Event,
  EventCreateInput,
  EventJsonData,
} from "./types";

type EventCreate<E> = Prisma.EventCreateWithoutListItemInput & { type: E }

export const EVENTS = {

  // Completely new form
  [ListItemEvent.NEW]: (): EventCreate<"NEW"> => ({
      type: ListItemEvent.NEW,
      jsonData: {
        eventName: "new",
      },
  }),


  [ListItemEvent.PUBLISHED]: (userId: number) => ({
    type: ListItemEvent.PUBLISHED,
    jsonData: {
      eventName: "publish",
      userId,
    }
  }),

  [ListItemEvent.UNPUBLISHED]: (userId?: number) => ({
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
        ...(userId && { userId })
      }
  }),


  [ListItemEvent.PINNED]: (userId: number) => ({
      type: ListItemEvent.PINNED,
      jsonData: {
        eventName: "pin",
        userId,
      },
  }),

  [ListItemEvent.UNPINNED]: (userId: number) => {
    return {
      type: ListItemEvent.UNPINNED,
      jsonData: {
        eventName: "unpin",
        userId,
      },
    }
  },

  [ListItemEvent.DELETED]: (userId: number) => ({
    type: ListItemEvent.DELETED,
    jsonData: {
      eventName: "deleted",
      userId,
    },
  }),

  /**
   * After post requests a change.
   */
  [ListItemEvent.OUT_WITH_PROVIDER]: (userId: number, requestedChanges: string) => ({
    type: ListItemEvent.OUT_WITH_PROVIDER,
    jsonData: {
      eventName: "requestChange",
      userId,
      requestedChanges,
    },
  }),

  /**
   * After the provider makes the change
   */
  [ListItemEvent.EDITED]: () => ({
    type: ListItemEvent.EDITED,
    jsonData: {
      eventName: "edited"
    }
  }),


  [ListItemEvent.CHECK_ANNUAL_REVIEW]: () => ({
    type: ListItemEvent.CHECK_ANNUAL_REVIEW,
    jsonData: {
      eventName: "check annual review"
    }
  }),

  [ListItemEvent.ANNUAL_REVIEW_STARTED]: () => ({
    type: ListItemEvent.CHECK_ANNUAL_REVIEW,
    jsonData: {
      eventName: "annual review started"
    }
  })
};


