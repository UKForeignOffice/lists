import { isBefore, startOfToday } from "date-fns";
import { prisma } from "server/models/db/prisma-client";
import { ListJsonData } from "server/models/types";
import { isEqual } from "lodash";
import { schedulerLogger } from "scheduler/logger";

export async function findListsToResetAnnualReview() {
  const logger = schedulerLogger.child({ method: "findListsToResetAnnualReview", timeframe: "day" });

  const today = startOfToday().toISOString();
  const lists = await prisma.list.findMany({
    where: {
      nextAnnualReviewStartDate: {
        lte: today,
        not: null,
      },
      jsonData: {
        path: ["currentAnnualReview", "eligibleListItems"],
        not: "",
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

  const listsToResetAnnualReview = lists.filter((list) => {
    const jsonData = list.jsonData as ListJsonData;
    const unpublishDate = new Date(jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
    const resetState = isBefore(unpublishDate, startOfToday()) || isEqual(unpublishDate, startOfToday());
    return resetState;
  });
  logger.info(
    `found ${listsToResetAnnualReview.length} lists to reset annual review state [${listsToResetAnnualReview.map(
      (list) => list.id
    )}]`
  );
  return listsToResetAnnualReview;
}
