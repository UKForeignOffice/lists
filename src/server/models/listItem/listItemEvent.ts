import { prisma } from "../db/prisma-client";
import { Prisma, ListItemEvent } from "@prisma/client";
import {
  Event,
  EventCreateInput,
  EventJsonData
} from "./types";
import { logger } from "server/services/logger";

type EventCreate<E extends ListItemEvent> = Prisma.EventCreateWithoutListItemInput & { type: E };

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

  [ListItemEvent.ARCHIVED]: (userId: number): EventCreate<"ARCHIVED"> => ({
    type: ListItemEvent.ARCHIVED,
    jsonData: {
      eventName: "archived",
      userId,
    },
  }),

  [ListItemEvent.UNPUBLISHED]: (userId?: number): EventCreate<"UNPUBLISHED"> => ({
    type: ListItemEvent.UNPUBLISHED,
    jsonData: {
      eventName: "unpublish",
      ...(userId && { userId }),
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

  [ListItemEvent.DELETED]: (userId: number, id?: number): EventCreate<"DELETED"> => ({
    type: ListItemEvent.DELETED,
    ...(id && { listItemId: id }),
    jsonData: {
      eventName: "deleted",
      userId,
    },
  }),

  /**
   * After post requests a change.
   */
  [ListItemEvent.OUT_WITH_PROVIDER]: (userId: number, requestedChanges: string): EventCreate<"OUT_WITH_PROVIDER"> => ({
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
  [ListItemEvent.EDITED]: (updatedJsonData = {}): EventCreate<"EDITED"> => ({
    type: ListItemEvent.EDITED,
    jsonData: {
      notes: ["user resubmitted with this data"],
      eventName: "edited",
      updatedJsonData,
    },
  }),

  [ListItemEvent.CHECK_ANNUAL_REVIEW]: (): EventCreate<"CHECK_ANNUAL_REVIEW"> => ({
    type: ListItemEvent.CHECK_ANNUAL_REVIEW,
    jsonData: {
      eventName: "check annual review",
    },
  }),

  [ListItemEvent.ANNUAL_REVIEW_STARTED]: (): EventCreate<"ANNUAL_REVIEW_STARTED"> => ({
    type: ListItemEvent.ANNUAL_REVIEW_STARTED,
    jsonData: {
      eventName: "annual review started",
    },
  }),
};

export function recordEvent(
  eventData: EventJsonData,
  listItemId: number,
  eventType: ListItemEvent
): Prisma.Prisma__EventClient<Event> {
  logger.debug(`event type ${eventType} to record`);
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
  logger.debug(`creating Event record with data [${JSON.stringify(data)}`);

  return prisma.event.create({ data }) as Prisma.Prisma__EventClient<Event>;
}
