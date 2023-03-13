import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

export async function unpublishListItems(ids: number[], reference?: string) {
  return ids.map(async (listItemId: number) => {
    return await prisma.listItem.update({
      where: {
        id: listItemId,
      },
      data: {
        status: "ANNUAL_REVIEW_OVERDUE",
        isAnnualReview: false,
        isPublished: false,
        history: {
          create: [EVENTS.ANNUAL_REVIEW_OVERDUE(reference), EVENTS.UNPUBLISHED(undefined, reference)],
        },
      },
    });
  });
}
