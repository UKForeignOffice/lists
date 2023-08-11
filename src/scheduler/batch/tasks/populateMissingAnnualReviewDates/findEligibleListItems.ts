import { prisma } from "scheduler/prismaClient";
import { subDaysFromISODate } from "server/components/dashboard/annualReview/helpers.keyDates";

/**
 * Finds ListItems which have not been published (or republished) 2 months (28 days) before the annual review is due to start.
 * This is to prevent Post and Providers from having to re-review their details since they have been reviewed recently.
 */
export async function findEligibleListItems(listId: number) {
  const list = await prisma.list.findUnique({
    where: {
      id: listId,
    },
    select: {
      nextAnnualReviewStartDate: true,
    },
  });

  if (!list) {
    return;
  }

  const { nextAnnualReviewStartDate } = list;

  if (!nextAnnualReviewStartDate) {
    return;
  }

  return await prisma.listItem.findMany({
    where: {
      listId,
      isPublished: true,
      isAnnualReview: false,
      history: {
        none: {
          type: "PUBLISHED",
          time: {
            gte: subDaysFromISODate(nextAnnualReviewStartDate, 56),
          },
        },
      },
    },
  });
}
