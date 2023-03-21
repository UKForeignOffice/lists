import { logger } from "scheduler/logger";

async function main() {
  // if a task needs to be executed first, await them here.

  // put all worker tasks to be executed here. They will be executed async (non blocking/non sequential).
  const tasks = [];

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
