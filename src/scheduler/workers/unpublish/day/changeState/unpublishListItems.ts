import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

export async function unpublishListItems(ids: number[]) {
  return ids.map(async (listItemId: number) => {
    return await prisma.listItem.update({
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
