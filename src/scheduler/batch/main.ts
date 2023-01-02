import { findListByAnnualReviewDate, updateListForAnnualReview } from "server/models/list";
import { List } from "server/models/types";
import { logger } from "server/services/logger";
import { findListItems } from "server/models/listItem";
import { SCHEDULED_PROCESS_TODAY_DATE } from "server/config";
import * as helpers from "./helpers";
import { getCurrentAnnualReviewData, getDateForContext } from "./helpers";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { formatDate } from "../helpers";
import { isBefore, subDays, subMonths } from "date-fns";

export async function populateCurrentAnnualReview(
  lists: List[],
  contexts: helpers.SchedulerDateContexts
): Promise<void> {
  const listIds = lists.map((list) => list.id);
  const findListItemsResult = await findListItems({
    listIds,
    statuses: ["PUBLISHED", "CHECK_ANNUAL_REVIEW"],
    isAnnualReview: false,
  });
  if (findListItemsResult.error) {
    logger.error(`Unable to retrieve List Items for Lists ${listIds}: ${findListItemsResult.error.message}`);
    return;
  }
  if (!findListItemsResult.result.length) {
    logger.info(`No List Items found for Lists ${listIds}`);
    return;
  }
  const listItemsForAllLists: ListItemWithHistory[] = findListItemsResult.result;
  for (const list of lists) {
    // exclude list items published in the last month from annual review
    const listItemsEligibleForAnnualReview = listItemsForAllLists.filter((listItem) => {
      if (!listItem.history.length) {
        return false;
      }
      return listItem.listId === list.id;
    });
    if (!listItemsEligibleForAnnualReview.length) {
      logger.info(`No list items identified for list ${list.id}, excluding from sending annual review emails`);
      return;
    }
    const listItemIdsForAnnualReview = listItemsEligibleForAnnualReview.map((listItem) => listItem.id);
    const currentAnnualReview = getCurrentAnnualReviewData(listItemIdsForAnnualReview, contexts);
    await updateListForAnnualReview(list, { currentAnnualReview });
  }
}

export async function updateListsForAnnualReview(todayDateString: string): Promise<void> {
  const today = new Date(todayDateString);
  const contexts = helpers.getDateContexts(today);
  const annualReviewStartContext = getDateForContext(
    contexts,
    "annualReview",
    helpers.schedulerMilestoneDays.both.START
  );
  if (annualReviewStartContext) {
    // @todo also get the lists without an annual review date that were first published 1 year ago. Only needed if List.annualReviewStartDate not populated
    const { result } = await findListByAnnualReviewDate(annualReviewStartContext.eventDate);

    // exclude lists that already have currentAnnualReview populated
    const lists = result?.filter(list => !list.jsonData.currentAnnualReview);

    logger.info(`Found ${lists?.length} Lists matching annual review start date [${annualReviewStartContext.eventDate}]`);
    if (!lists?.length) {
      logger.info(`No lists found for annual review date ${annualReviewStartContext.eventDate}`);
      return;
    }
    // @ts-ignore
    await populateCurrentAnnualReview(lists, contexts);
  }
}

/**
 * todayDateString can be overridden here if you want to run the process for different dates.  For example:-
 *    todayDateString = formatDate(subDays(new Date(), 28)); // today is annual review start date
 *    todayDateString = formatDate(subDays(new Date(), 27)); // today is day before annual review start date
 *    todayDateString = formatDate(subDays(new Date(), 21)); // today is one week before annual review start date
 */
const todayDateString = SCHEDULED_PROCESS_TODAY_DATE;
updateListsForAnnualReview(todayDateString)
  .then((r) => {
    logger.info(`Batch scheduler finished`);
    process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Batch scheduler failed due to ${r.message}, ${r.stack}`);
    process.exit(1);
  });
