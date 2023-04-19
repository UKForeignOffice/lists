import { main as unpublishWeeklyTask } from "./unpublish/weekly";
import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { main as unpublishDayTask } from "./unpublish/day";
import { processAnnualReview as processListsBeforeAndDuringStart } from "./processListsBeforeAndDuringStart/main";
import { logger } from "scheduler/logger";
import { startOfToday } from "date-fns";

async function main() {
  const chosenDate = getDateFromFlag() ?? startOfToday();
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

function getDateFromFlag(): Date | null {
  const dateIndex = process.argv.indexOf("--date") ?? process.env.TEST_DATE;
  if (dateIndex === -1 || dateIndex === process.argv.length - 1) {
    return null;
  }
  const dateString = process.argv[dateIndex + 1] ?? process.env.TEST_DATE;
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
