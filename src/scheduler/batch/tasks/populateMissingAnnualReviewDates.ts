import { prisma } from "scheduler/batch/model";
import { addDays, addYears, isBefore, startOfDay, startOfToday } from "date-fns";
import { schedulerLogger } from "scheduler/logger";
import { FirstPublishedOnList } from "@prisma/client";

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

  logger.info(`${listIds.length} lists with nextAnnualReviewDate to be updated ${listIds}`);

  const rows = await prisma.firstPublishedOnList.findMany({
    where: {
      listId: {
        in: listIds,
      },
    },
  });

  const updates = await Promise.allSettled(rows.map(addAnnualReviewStartDate));

  updates
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });

  return updates;
}

async function addAnnualReviewStartDate({ firstPublished, listId }: FirstPublishedOnList) {
  /**
   * Annual review start date must be set at least 29 days in future, from today.
   */

  const proposedDate = addYears(firstPublished, 1);
  const minDate = addDays(startOfToday(), 29);

  const proposedDateIsWithinAMonth = isBefore(proposedDate, minDate);
  const newStartDate = proposedDateIsWithinAMonth ? minDate : startOfDay(proposedDate);

  if (proposedDateIsWithinAMonth) {
    logger.info(
      `listId: ${listId} has firstPublished date of ${firstPublished.toISOString()}. Proposed date (${newStartDate}) is within 29 days from today, setting ${minDate} instead`
    );
  }

  logger.info(`listId: ${listId} setting newAnnualReviewStartDate: ${newStartDate}`);

  return await prisma.list.update({
    id: listId,
    data: {
      nextAnnualReviewStartDate: newStartDate,
    },
  });
}
