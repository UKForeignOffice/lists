import { findListByAnnualReviewDate, updateListForAnnualReview } from "scheduler/dbHelpers";
import type { List } from "server/models/types";
import { logger } from "scheduler/logger";
import * as helpers from "../helpers";
import { getCurrentAnnualReviewData, schedulerMilestoneDays } from "../helpers";
import { addDays } from "date-fns";
import _ from "lodash";
import { findEligibleListItems } from "./populateMissingAnnualReviewDates/findEligibleListItems";

/**
 * @param list - from {@link findListByAnnualReviewDate}. These lists are due to start annual review.
 */
export async function populateCurrentAnnualReview(list: List): Promise<void> {
  const listItems = await findEligibleListItems(list.id);

  if (!listItems?.length) {
    logger.info(`No list items identified for list ${list.id}, excluding from sending annual review emails`);
    return;
  }

  const listItemIdsForAnnualReview = listItems.map((listItem) => listItem.id);

  const contexts = helpers.getDateContexts(list.nextAnnualReviewStartDate);
  const currentAnnualReviewAlreadyExists = !!list.jsonData?.currentAnnualReview?.reference;

  const currentAnnualReview = getCurrentAnnualReviewData(listItemIdsForAnnualReview, contexts);

  let shouldUpdateList = true;

  // use the same reference if it already exists to ensure audit records can be checked for previous emails
  if (currentAnnualReviewAlreadyExists) {
    const existingCurrentAnnualReview = list.jsonData.currentAnnualReview!;
    const existingEligibleListItems = existingCurrentAnnualReview.eligibleListItems.sort(numeric);
    const newEligibleListItems = currentAnnualReview.eligibleListItems.sort(numeric);
    shouldUpdateList = !_.isEqual(existingEligibleListItems, newEligibleListItems);
    if (shouldUpdateList) {
      currentAnnualReview.reference = existingCurrentAnnualReview.reference;
      currentAnnualReview.keyDates = existingCurrentAnnualReview.keyDates;
    }
  }

  if (shouldUpdateList) {
    await updateListForAnnualReview(list, { currentAnnualReview });
  }
}

export async function updateListsForAnnualReview(today: Date) {
  let annualReviewStartDate;
  try {
    annualReviewStartDate = addDays(today, schedulerMilestoneDays.post.ONE_MONTH);
  } catch (e) {
    logger.error(
      `There was an error calculating ${today} + ${schedulerMilestoneDays.post.ONE_MONTH} days - ${e.message}`
    );
  }

  if (!annualReviewStartDate) {
    throw Error(`Could not updateListsForAnnualReview`);
  }

  const { result: lists = [] } = await findListByAnnualReviewDate(annualReviewStartDate);
  logger.info(
    `Found the lists ${lists.map((list) => list.id)} matching annual review start date ${annualReviewStartDate}`
  );

  const promises = lists.map(populateCurrentAnnualReview);

  return await Promise.allSettled(promises);
}

function numeric(a: number, b: number) {
  return a - b;
}
