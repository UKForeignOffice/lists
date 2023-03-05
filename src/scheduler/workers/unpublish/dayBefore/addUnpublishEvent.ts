import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

export async function addUnpublishedEvents(ids: number[]) {

  ids.forEach(async (listItemId: number) => {
    await prisma.listItem.update({
      where: {
        id: listItemId,
      },
      data: {
        status: "UNPUBLISHED",
        isAnnualReview: false,
        isPublished: false,
        history: {
          create: EVENTS.UNPUBLISHED(),
        },
      },
    });
  });
}
