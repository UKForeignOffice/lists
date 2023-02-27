import { logger } from "server/services/logger";
import { sendEmailsToNonRespondents } from "./sendEmailToNonRespondents";
import { findListsInAnnualReview } from "./findListsInAnnualReview";

async function main() {
  const listsInAnnualReview = await findListsInAnnualReview();
  return await Promise.allSettled(listsInAnnualReview.map(sendEmailsToNonRespondents));
}

main()
  .then((results) => {
    results
      .filter((result) => result.status !== "fulfilled")
      .forEach((failedResult) => {
        // @ts-ignore
        logger.error(failedResult.reason);
      });

    // process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Weekly reminder scheduler failed due to ${r.message}, ${r.stack}`);
    // process.exit(1);
  });
