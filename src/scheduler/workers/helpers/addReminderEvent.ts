import {SendEmailResponse} from "notifications-node-client";
import {prisma} from "server/models/db/prisma-client";
import {EVENTS} from "server/models/listItem/listItemEvent";

export async function addReminderEvent(
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
