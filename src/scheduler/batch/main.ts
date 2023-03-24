import { logger } from "scheduler/logger";
import { updateListsForAnnualReview } from "./tasks";
import { startOfToday } from "date-fns";
import { populateMissingAnnualReviewDates } from "./tasks/populateMissingAnnualReviewDates";

async function main() {
  // if a task needs to be executed first, await them here.
  logger.info("starting populateMissingAnnualReviewDates");
  await populateMissingAnnualReviewDates();

  logger.info("starting updateListsForAnnualReview");
  await updateListsForAnnualReview(startOfToday());

  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  /*
   const tasks = [];
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
