import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview as processListsBeforeAndDuringStart } from "./processListsBeforeAndDuringStart/main";
import { main as resendRequestedEditEmail } from "./resendRequestedEditEmail";
import { logger } from "scheduler/logger";
import deleteItemsAfterAYear from "./unpublish/delete";

const SCHEDULER_WORKER_RUN_TASK = process.env.SCHEDULER_WORKER_RUN_TASK;

/**
 * Use this to retry one task.
 * `npm run task:resendRequestedEditEmail` or
 * `SCHEDULER_WORKER_RUN_TASK="resendRequestedEditEmail" node dist/scheduler/run`
 */
export async function run(taskName: string) {
  logger.info(`Task requested was ${taskName}`);

  if (!SCHEDULER_WORKER_RUN_TASK) {
    logger.error(`SCHEDULER_WORKER_RUN_TASK not set`);
    process.exit(1);
  }

  const tasks = {
    unpublishWeeklyTask,
    unpublishDayTask,
    unpublishDayBeforeTask,
    processListsBeforeAndDuringStart,
    resendRequestedEditEmail,
    deleteItemsAfterAYear,
  };

  // @ts-ignore
  const task = tasks[taskName];
  if (!task) {
    logger.error(`Task ${task} not found`);
    process.exit(1);
  }

  return await task();
}
