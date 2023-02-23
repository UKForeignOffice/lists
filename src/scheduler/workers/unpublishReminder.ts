import { logger } from "server/services/logger";
import { findListsInAnnualReview } from "./unpublish/weekly/unpublish";
import { sendEmailsToNonRespondents } from "./unpublish/weekly/sendEmailToNonRespondents";

async function main() {
  const listsInAnnualReview = await findListsInAnnualReview();
  listsInAnnualReview.forEach(sendEmailsToNonRespondents);
  console.log();
}

main()
  .then((r) => {
    logger.info(`Respondents`);

    // process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Annual review scheduler failed due to ${r.message}, ${r.stack}`);
    // process.exit(1);
  });
