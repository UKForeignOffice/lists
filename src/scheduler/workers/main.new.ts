import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/unpublishDay";
import { processAnnualReview } from "./main";
import { logger } from "server/services/logger";

async function main() {
  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  const tasks = [processAnnualReview(), unpublishWeeklyTask(), unpublishDayBeforeTask(), unpublishDayTask()];
  // const tasks = [unpublishWeeklyTask()];

  return await Promise.allSettled(tasks);
}

main()
  .then((promiseResults) => {
    process.exit(0);
  })
  .catch((promiseRejects) => {
    logger.error(promiseRejects);
    process.exit(1);
  });
