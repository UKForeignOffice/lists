import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";
import { SendEmailResponse } from "notifications-node-client";

export async function addUnpublishReminderEvent(
  id: number,
  response: SendEmailResponse,
  notes?: string[],
  reference?: string
) {
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
