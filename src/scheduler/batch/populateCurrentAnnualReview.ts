import { List } from "server/models/types";
import { findListItems } from "server/models/listItem";
import { logger } from "server/services/logger";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import * as helpers from "./helpers";
import { getCurrentAnnualReviewData } from "./helpers";
import _ from "lodash";
import { updateListForAnnualReview } from "server/models/list";

export async function populateCurrentAnnualReview(lists: List[]): Promise<void> {
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
    } else {
      const listItemIdsForAnnualReview = listItemsEligibleForAnnualReview.map((listItem) => listItem.id);

      const contexts = helpers.getDateContexts(list.nextAnnualReviewStartDate);
      const currentAnnualReview = getCurrentAnnualReviewData(listItemIdsForAnnualReview, contexts);
      let isUpdateList = true;
      // use the same reference if it already exists to ensure audit records can be checked for previous emails
      if (list.jsonData?.currentAnnualReview?.reference) {
        const { eligibleListItems: currentEligibileListItems } = list.jsonData.currentAnnualReview;
        const { eligibleListItems: newEligibileListItems } = currentAnnualReview;
        isUpdateList = !_.isEqual(
          currentEligibileListItems.sort((a, b) => a - b),
          newEligibileListItems.sort((a, b) => a - b)
        );
        if (isUpdateList) {
          currentAnnualReview.reference = list.jsonData.currentAnnualReview.reference;
          currentAnnualReview.keyDates = list.jsonData.currentAnnualReview.keyDates;
        }
      }

      if (isUpdateList) {
        await updateListForAnnualReview(list, { currentAnnualReview });
      }
    }
  }
}
