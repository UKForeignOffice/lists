import { logger } from "server/services/logger";
import { sendEmailsToNonRespondents } from "./sendEmailToNonRespondents";
import { findListsInAnnualReviewForReminders } from "../findListsInAnnualReviewForReminders";

export async function main() {
  const listsInAnnualReview = await findListsInAnnualReviewForReminders();
  const results = await Promise.allSettled(listsInAnnualReview.map(sendEmailsToNonRespondents));
  results
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });
}
