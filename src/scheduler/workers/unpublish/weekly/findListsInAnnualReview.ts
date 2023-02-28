import { startOfToday } from "date-fns";
import { prisma } from "server/models/db/prisma-client";

export async function findListsInAnnualReview() {
  const today = startOfToday().toISOString();
  return await prisma.list.findMany({
    where: {
      nextAnnualReviewStartDate: {
        lte: today,
        not: null,
      },
      items: {
        some: {
          isAnnualReview: true,
        },
      },
    },
  });
}
