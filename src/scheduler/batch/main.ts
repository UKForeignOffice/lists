import { updateListsForAnnualReview } from "./updateListsForAnnualReview";
import { startOfDay } from "date-fns";
import { logger } from "server/services/logger";

/**
 * todayDateString can be overridden here if you want to run the process for different dates.  For example:-
 *    todayDateString = formatDate(subDays(new Date(), 28)); // today is annual review start date
 *    todayDateString = formatDate(subDays(new Date(), 27)); // today is day before annual review start date
 *    todayDateString = formatDate(subDays(new Date(), 21)); // today is one week before annual review start date
 */
updateListsForAnnualReview(startOfDay(new Date()))
  .then((r) => {
    logger.info(`Batch scheduler finished`);

    process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Batch scheduler failed due to ${r.message}, ${r.stack}`);
    process.exit(1);
  });
