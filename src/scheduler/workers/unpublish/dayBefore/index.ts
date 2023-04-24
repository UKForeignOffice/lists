import { findListsInAnnualReview } from "../findListsInAnnualReview";
import { sendDayBeforeEmails } from "scheduler/workers/unpublish/dayBefore/sendDayBeforeEmails";
import { schedulerLogger } from "scheduler/logger";

export async function main() {
  const logger = schedulerLogger.child({ method: "day before unpublish", timeframe: "dayBefore" });

  const listsInAnnualReview = await findListsInAnnualReview();

  logger.info(`Sending day before unpublish emails for lists [${listsInAnnualReview.map((list) => list.id)}]`);
  const emailTasks = listsInAnnualReview.map(async (list) => await sendDayBeforeEmails(list));
  await Promise.allSettled(emailTasks);
}
