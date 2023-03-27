import { logger } from "scheduler/logger";
import { findEligibleListItems, updateListForAnnualReview } from "scheduler/batch/model";

import * as helpers from "../helpers";
import _ from "lodash";

export async function updateListsForAnnualReview(): Promise<void> {
  const listsWithEligibleListItems = await findEligibleListItems();
  if (listsWithEligibleListItems.error) {
    logger.error(`Unable to retrieve List Items for Lists`);
    return;
  }
  if (!listsWithEligibleListItems.result.length) {
    logger.info(`No List Items found for Lists`);
    return;
  }

  for (const list of listsWithEligibleListItems.result) {
    if (!list.items.length) {
      logger.info(`No list items identified for list ${list.id}, excluding from sending annual review emails`);
      return;
    }
    const contexts = helpers.getDateContexts(list.nextAnnualReviewStartDate!);
    const listItemIds = list.items.map((listItem) => listItem.id);
    const currentAnnualReview = helpers.getCurrentAnnualReviewData(listItemIds, contexts);
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
