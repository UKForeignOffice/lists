import { prisma } from "scheduler/batch/model";
import { schedulerLogger } from "scheduler/logger";
import { addAnnualReviewStartDate } from "./addAnnualReviewStartDate";

const logger = schedulerLogger.child({ method: "populateAnnualReviewDates" });

export async function main() {
  const listsWithoutNextAnnualReview = await prisma.firstPublishedOnList.findMany({
    where: {
      nextAnnualReviewStartDate: null,
    },
  });

  logger.info(
    `${
      listsWithoutNextAnnualReview.length
    } lists with nextAnnualReviewDate to be updated ${listsWithoutNextAnnualReview.map(({ listId }) => listId)}`
  );

  const updates = await Promise.allSettled(listsWithoutNextAnnualReview.map(addAnnualReviewStartDate));

  updates
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      logger.error(`Unable to add annual review start dates due to ${(failedResult as PromiseRejectedResult).reason}`);
    });

  return updates;
}
