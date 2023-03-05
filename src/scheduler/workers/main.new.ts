import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview } from "./main";
import { logger } from "server/services/logger";

async function main() {
  await processAnnualReview()
  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  // const tasks = [unpublishWeeklyTask(), unpublishDayBeforeTask(), unpublishDayTask()];
  // @todo UNCOMMENT this once finished testig
  // return await processAnnualReview();

  const tasks = [unpublishDayTask()];

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
