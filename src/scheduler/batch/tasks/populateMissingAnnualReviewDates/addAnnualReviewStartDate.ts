import type { FirstPublishedOnList } from "@prisma/client";
import { addAnnualReviewToList } from "scheduler/batch/model";
import { schedulerLogger } from "scheduler/logger";
import { startDateFromFirstPublishedDate } from "./startDateFromFirstPublishedDate";

const logger = schedulerLogger.child({ method: "addAnnualReviewStartDate" });

export async function addAnnualReviewStartDate({ firstPublished, listId }: FirstPublishedOnList) {
  const startDate = startDateFromFirstPublishedDate(firstPublished, listId);

  logger.info(
    `listId: ${listId} was firstPublished on ${firstPublished.toISOString()} setting newAnnualReviewStartDate: ${startDate}`
  );

  return await addAnnualReviewToList({ listId, oneYearAfterFirstPublishedDate: startDate });
}
