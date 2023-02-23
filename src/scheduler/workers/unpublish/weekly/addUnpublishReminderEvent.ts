import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

async function addUnpublishReminderEvent(id, weeks, meta) {
  await prisma.listItem.update({
    data: {
      history: {
        create: {
          data: EVENTS.REMINDER(),
        },
      },
    },
  });
}
