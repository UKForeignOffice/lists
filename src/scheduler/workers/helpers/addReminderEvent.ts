import type { AnnualReviewProviderEmailType } from "@prisma/client";
import type { SendEmailResponse } from "notifications-node-client";
import { prisma } from "scheduler/prismaClient";
import { EVENTS } from "shared/listItemEvent";

interface AddReminderEventInput {
  id: number;
  response: SendEmailResponse;
  notes?: string[];

  /**
   * Annual review reference
   */
  reference?: string;
  emailType: AnnualReviewProviderEmailType;
}

export async function addReminderEvent({ id, response, notes, reference, emailType }: AddReminderEventInput) {
  return await prisma.listItem.update({
    where: {
      id,
    },
    data: {
      history: {
        create: EVENTS.REMINDER({ response, notes, reference, emailType }),
      },
    },
  });
}
