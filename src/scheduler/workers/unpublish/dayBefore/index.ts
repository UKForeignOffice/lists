import { logger } from "server/services/logger";
import { sendEmailsToNonRespondents } from "./sendEmailToNonRespondents";
import { findListsInAnnualReviewForReminders } from "../findListsInAnnualReviewForReminders";

export async function main() {
  logger.info("starting dayBefore.findListsInAnnualReview");
  const listsInAnnualReview = await findListsInAnnualReviewForReminders();
  logger.info(`retrieved ${listsInAnnualReview.length} lists.  Attempting to send emails`);
  const results = await Promise.allSettled(listsInAnnualReview.map(sendEmailsToNonRespondents));
  results
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });
  logger.info("ending dayBefore.findListsInAnnualReview");
}
