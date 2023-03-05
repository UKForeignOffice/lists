import { logger } from "server/services/logger";
import { findListsInAnnualReviewForReminders } from "../findListsInAnnualReviewForReminders";
import { changeState } from "scheduler/workers/unpublish/day/changeState";
import { findListsToResetAnnualReview } from "scheduler/workers/unpublish/day/changeState/findListsToResetAnnualReview";
import { sendUnpublishEmails } from "scheduler/workers/unpublish/day/sendUnpublishEmails";

export async function main() {
  const listsInAnnualReview = await findListsInAnnualReviewForReminders();
  const results = await Promise.allSettled([listsInAnnualReview.map(sendUnpublishEmails)]);
  const listsToResetAnnualReview = await findListsToResetAnnualReview();
  await Promise.allSettled(listsToResetAnnualReview.map(await changeState));

  results
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });
}
