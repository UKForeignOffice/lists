import { startOfToday } from "date-fns";
import { prisma } from "scheduler/prismaClient";

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
    include: {
      country: {
        select: {
          name: true,
        },
      },
    },
  });
}
