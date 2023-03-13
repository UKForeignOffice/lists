import { startOfToday } from "date-fns";
import { prisma } from "server/models/db/prisma-client";
import { schedulerLogger } from "scheduler/logger";

export async function findListsToResetAnnualReview() {
  const logger = schedulerLogger.child({ method: "findListsToResetAnnualReview", timeframe: "day" });

  const today = startOfToday().toISOString();
  const lists = await prisma.list.findMany({
    where: {
      AND: [
        {
          nextAnnualReviewStartDate: {
            lte: today,
            not: null,
          },
        },
        {
          jsonData: {
            path: ["currentAnnualReview", "eligibleListItems"],
            not: "",
          },
        },
        {
          jsonData: {
            path: ["currentAnnualReview", "keyDates", "unpublished", "UNPUBLISH"],
            lte: startOfToday().toISOString(),
          },
        },
      ],
    },
    include: {
      country: {
        select: {
          name: true,
        },
      },
    },
  });
  logger.info(`found ${lists.length} lists to reset annual review state [${lists.map((list) => list.id)}]`);
  return lists;
}
