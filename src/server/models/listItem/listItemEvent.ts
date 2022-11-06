import { prisma } from "../db/prisma-client";
import {Prisma, ListItemEvent} from "@prisma/client";

import {
  Event,
  EventCreateInput,
  EventJsonData,
} from "./types";

/**
 * @deprecated, these can be created via prisma nested writes
 */
export function recordEvent(
  eventData: EventJsonData,
  listItemId: number,
  eventType: ListItemEvent
): Prisma.Prisma__EventClient<Event> {
  const data: EventCreateInput = {
    time: new Date(),
    type: eventType,
    jsonData: { ...eventData },
    listItem: {
      connect: {
        id: listItemId,
      }
    }
  };

  return prisma.event.create({ data }) as Prisma.Prisma__EventClient<Event>;
}


/**
 * value with this type be Prisma.EventCreateWithoutListItemInput or a function that returns it.
 * by using `<E>` and `& { type: E }`, the returned value must include the type that was passed into the generic.
 */

// type ReturnsWithEventType<E> = ((...args: any[]) => Prisma.EventCreateWithoutListItemInput & { type: E })
// type ReturnsWithEventType<E> = Prisma.EventCreateWithoutListItemInput & { type: E }
/**
 * Iterate through ListItemEvents and ensure the value is the matching `ReturnsWithEventType`.
 * ```
 * // invalid because the key (ListItemEvent.UNPUBLISHED) does not match type: ListItemEvent.PUBLISHED.
 * {
 *   [ListItemEvent.UNPUBLISHED]: {...otherProps, type: ListItemEvent.PUBLISHED }
 * }
 *
 * ```
 */

export const EVENTS = {

  // Completely new form
  [ListItemEvent.NEW]: {
      type: ListItemEvent.NEW,
      jsonData: {
        eventName: "new",
      },
  },


  [ListItemEvent.PUBLISHED](userId: number) {
    return {
      type: ListItemEvent.PUBLISHED,
      jsonData: {
        eventName: "publish",
        userId,
      }
    }
  },


  [ListItemEvent.UNPUBLISHED]: (userId: number)  => ({
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
        userId,
      }
  }),


  [ListItemEvent.PINNED]: function (userId: number) {
    return {
      type: ListItemEvent.PINNED,
      jsonData: {
        eventName: "pin",
        userId,
      },
    }
  },

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


  [ListItemEvent.REVIEWED]: (userId: number) => ({
    type: ListItemEvent.REVIEWED,
    jsonData: {
      eventName: "reviewed",
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


} as const;

