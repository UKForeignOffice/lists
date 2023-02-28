import { logger } from "server/services/logger";
import { sendEmailsToNonRespondents } from "./sendEmailToNonRespondents";
import { findListsInAnnualReview } from "./findListsInAnnualReview";

export async function main() {
  const listsInAnnualReview = await findListsInAnnualReview();
  const results = await Promise.allSettled(listsInAnnualReview.map(sendEmailsToNonRespondents));
  results
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(failedResult.reason);
    });
}

main()
  .then((results) => {
    // process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Weekly reminder scheduler failed due to ${r.message}, ${r.stack}`);
    // process.exit(1);
  });
