import type { SendEmailResponse } from "notifications-node-client";
import { prisma } from "shared/prisma";
import { EVENTS } from "shared/listItemEvent";

export async function addReminderEvent(id: number, response: SendEmailResponse, notes?: string[], reference?: string) {
  return await prisma.listItem.update({
    where: {
      id,
    },
    data: {
      history: {
        create: EVENTS.REMINDER(response, notes, reference),
      },
    },
  });
}
