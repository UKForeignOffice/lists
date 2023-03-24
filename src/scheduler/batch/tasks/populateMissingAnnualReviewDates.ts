import { prisma } from "scheduler/batch/model";
import { schedulerLogger } from "scheduler/logger";
import { addAnnualReviewStartDate } from "./addAnnualReviewStartDate";

const logger = schedulerLogger.child({ method: "populateMissingAnnualReviewDates" });

export async function populateMissingAnnualReviewDates() {
  const listsWithoutAnnualReview = await prisma.list.findMany({
    where: {
      nextAnnualReviewStartDate: null,
    },
    select: {
      id: true,
    },
  });

  const listIds = listsWithoutAnnualReview.map(({ id }) => id);

  const rows = await prisma.firstPublishedOnList.findMany({
    where: {
      listId: {
        in: listIds,
      },
    },
  });

  logger.info(`${rows.length} lists with nextAnnualReviewDate to be updated ${rows.map(({ listId }) => listId)}`);

  const updates = await Promise.allSettled(rows.map(addAnnualReviewStartDate));

  updates
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });

  return updates;
}
