import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview as processListsBeforeAndDuringStart } from "./processListsBeforeAndDuringStart/main";
import { logger } from "scheduler/logger";

async function main() {
  // if a task needs to be executed first, await them here.
  try {
    await processListsBeforeAndDuringStart();
  } catch (e) {
    logger.error(e);
  }

  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  const tasks = [unpublishWeeklyTask(), unpublishDayBeforeTask(), unpublishDayTask()];

  return await Promise.allSettled(tasks);
}

main()
  .then((promiseResults) => {
    logger.info("All tasks completed");
    process.exit(0);
  })
  .catch((promiseRejects) => {
    logger.error(promiseRejects);
    process.exit(1);
  });
