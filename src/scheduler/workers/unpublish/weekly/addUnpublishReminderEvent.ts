import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

export async function addUnpublishReminderEvent(id: number, notes?: string[], reference?: string) {
  // return await prisma.listItem.update({
  //   where: {
  //     id,
  //   },
  //   data: {
  //     history: {
  //       create: EVENTS.REMINDER(notes, reference),
  //     },
  //   },
  // });
}
