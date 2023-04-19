import { prisma } from "server/models/db/prisma-client";

export async function findListsInAnnualReview(chosenDate: Date) {
  const today = chosenDate.toISOString();
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
