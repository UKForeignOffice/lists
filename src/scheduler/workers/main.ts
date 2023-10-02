import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview as processListsBeforeAndDuringStart } from "./processListsBeforeAndDuringStart/main";
import { logger } from "scheduler/logger";
import deleteItemsAfterAYear from "./unpublish/delete";
import { runSingleTask } from "./runSingleTask";

async function main() {
  if (process.env.SCHEDULER_WORKER_RUN_TASK) {
    logger.warn(`Task requested was ${process.env.SCHEDULER_WORKER_RUN_TASK}. Only running this task.`);
    return await runSingleTask(process.env.SCHEDULER_WORKER_RUN_TASK);
  }
  // if a task needs to be executed first, await them here.
  try {
    // await processListsBeforeAndDuringStart();
  } catch (e) {
    logger.error(e);
  }

  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  // const tasks = [unpublishWeeklyTask(), unpublishDayBeforeTask(), unpublishDayTask(), deleteItemsAfterAYear()];
  const tasks = [unpublishDayTask()];

  return await Promise.allSettled(tasks);
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
