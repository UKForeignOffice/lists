import {Prisma, ListItemEvent} from "@prisma/client";

type EventCreate<E extends ListItemEvent> = Prisma.EventCreateWithoutListItemInput & { type: E }

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
    }
  }),

  [ListItemEvent.UNPUBLISHED]: (userId?: number): EventCreate<"UNPUBLISHED"> =>  ({
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
        ...(userId && { userId })
      }
  }),


  [ListItemEvent.PINNED]: (userId: number): EventCreate<"PINNED"> =>  ({
      type: ListItemEvent.PINNED,
      jsonData: {
        eventName: "pin",
        userId,
      },
  }),

  [ListItemEvent.UNPINNED]: (userId: number): EventCreate<"UNPINNED"> =>  {
    return {
      type: ListItemEvent.UNPINNED,
      jsonData: {
        eventName: "unpin",
        userId,
      },
    }
  },

  [ListItemEvent.DELETED]: (userId: number): EventCreate<"DELETED"> =>  ({
    type: ListItemEvent.DELETED,
    jsonData: {
      eventName: "deleted",
      userId,
    },
  }),

  /**
   * After post requests a change.
   */
  [ListItemEvent.OUT_WITH_PROVIDER]: (userId: number, requestedChanges: string): EventCreate<"OUT_WITH_PROVIDER"> =>  ({
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
  [ListItemEvent.EDITED]: (): EventCreate<"EDITED"> =>  ({
    type: ListItemEvent.EDITED,
    jsonData: {
      eventName: "edited"
    }
  }),


  [ListItemEvent.CHECK_ANNUAL_REVIEW]: (): EventCreate<"CHECK_ANNUAL_REVIEW"> =>  ({
    type: ListItemEvent.CHECK_ANNUAL_REVIEW,
    jsonData: {
      eventName: "check annual review"
    }
  }),

  [ListItemEvent.ANNUAL_REVIEW_STARTED]: (): EventCreate<"ANNUAL_REVIEW_STARTED"> =>  ({
    type: ListItemEvent.ANNUAL_REVIEW_STARTED,
    jsonData: {
      eventName: "annual review started"
    }
  })
};


