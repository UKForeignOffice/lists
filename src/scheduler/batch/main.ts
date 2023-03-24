import { logger } from "scheduler/logger";
import { startOfToday } from "date-fns";
import { populateMissingAnnualReviewDates } from "./tasks/populateMissingAnnualReviewDates";
import { updateListsForAnnualReview } from "./tasks/updateListsForAnnualReview";

async function main() {
  // if a task needs to be executed first, await them here.
  logger.info("starting populateMissingAnnualReviewDates");
  await populateMissingAnnualReviewDates();

  logger.info("starting updateListsForAnnualReview");
  await updateListsForAnnualReview(startOfToday());

  // put all the tasks that can be run async (i.e. not required to be sequential) here.
  /*
   const tasks = []; // needs to be an array of promises.
   return await Promise.allSettled(tasks);
   */
}

main()
  .then(() => {
    logger.info("All tasks completed");
    process.exit(0);
  })
  .catch((promiseRejects) => {
    logger.error(promiseRejects);
    process.exit(1);
  });
