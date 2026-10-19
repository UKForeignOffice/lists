import type { NotifyEmailResponse } from "shared/notify-types";
import { prisma } from "scheduler/prismaClient";
import { EVENTS } from "shared/listItemEvent";

export async function addReminderEvent(
  id: number,
  response: NotifyEmailResponse,
  notes?: string[],
  reference?: string
) {
  return prisma.listItem.update({
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
