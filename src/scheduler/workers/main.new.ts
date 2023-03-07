import { main as unpublishDayBeforeTask } from "./unpublish/dayBefore";
import { processAnnualReview } from "./main";
import { logger } from "server/services/logger";

async function main() {
  await processAnnualReview();
  const tasks = [unpublishDayBeforeTask()];

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
