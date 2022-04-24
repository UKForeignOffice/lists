import { prisma } from "../db/prisma-client";
import { Prisma, ListItemEvent } from "@prisma/client";

import {
  Event,
  EventCreateInput,
  EventJsonData,
} from "./types";

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
