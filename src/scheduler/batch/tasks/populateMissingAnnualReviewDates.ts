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

async function addAnnualReviewStartDate({ firstPublished, listId }: FirstPublishedOnList) {
  /**
   * Annual review start date must be set at least 29 days in future, from today.
   */

  const proposedDate = startOfDay(addYears(firstPublished, 1));
  const minDate = addDays(startOfToday(), 29);

  const proposedDateIsWithinAMonth = isBefore(proposedDate, minDate);
  const newStartDate = proposedDateIsWithinAMonth ? minDate.toISOString() : startOfDay(proposedDate).toISOString();

  if (proposedDateIsWithinAMonth) {
    logger.info(
      `listId: ${listId} has firstPublished date of ${firstPublished}. Proposed date (${newStartDate}) is within 29 days from today, setting ${minDate} instead`
    );
  }

  logger.info(
    `listId: ${listId} was firstPublished on ${firstPublished.toISOString()} setting newAnnualReviewStartDate: ${newStartDate}`
  );

  return await prisma.list.update({
    where: {
      id: listId,
    },
    data: {
      nextAnnualReviewStartDate: newStartDate,
    },
  });
}
