import { findListsInAnnualReviewForReminders } from "../findListsInAnnualReviewForReminders";
import { findListsToResetAnnualReview } from "scheduler/workers/unpublish/day/changeState/findListsToResetAnnualReview";
import { sendUnpublishEmails } from "scheduler/workers/unpublish/day/sendUnpublishEmails";
import { schedulerLogger } from "scheduler/logger";
import { changeState } from "scheduler/workers/unpublish/day/changeState";

export async function main() {
  const logger = schedulerLogger.child({ method: "unpublish day", timeframe: "day" });

  const listsInAnnualReview = await findListsInAnnualReviewForReminders();
  const listsToResetAnnualReview = await findListsToResetAnnualReview();

  logger.info(`Sending unpublish emails for lists [${listsInAnnualReview.map((list) => list.id)}]`);
  const emailTasks = listsInAnnualReview.map(await sendUnpublishEmails);
  await Promise.allSettled(emailTasks);

  logger.info(`Resetting annual review state for lists [${listsToResetAnnualReview.map((list) => list.id)}]`);
  const stateTasks = listsToResetAnnualReview.map(await changeState);
  await Promise.allSettled(stateTasks);
}
