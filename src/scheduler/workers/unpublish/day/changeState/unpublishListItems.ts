import { prisma } from "shared/prisma";
import { EVENTS } from "shared/listItemEvent";

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
