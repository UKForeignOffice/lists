import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview as processListsBeforeAndDuringStart } from "./processListsBeforeAndDuringStart/main";
import { logger } from "scheduler/logger";
import { startOfToday } from "date-fns";

async function main() {
  const chosenDate = getDateFromEnvVariable() ?? startOfToday();
  // if a task needs to be executed first, await them here.
  try {
    await processListsBeforeAndDuringStart(chosenDate);
  } catch (e) {
    logger.error(e);
  }

  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  const tasks = [unpublishWeeklyTask(chosenDate), unpublishDayBeforeTask(chosenDate), unpublishDayTask(chosenDate)];

  return await Promise.allSettled(tasks);
}

function getDateFromEnvVariable(): Date | null {
  if (!process.env.TEST_DATE) {
    return null;
  }
  const dateString = process.env.TEST_DATE;
  const testDate = new Date(Number(dateString));
  return isNaN(testDate.getTime()) ? null : testDate;
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
