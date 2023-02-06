import { findListsWithCurrentAnnualReview } from "server/models/list";
import { logger } from "server/services/logger";
import { AnnualReviewKeyDates, Audit, AuditListItemEventName, List, UnpublishedKeyDates } from "server/models/types";
import { AuditEvent, ListItem, ListItemEvent } from "@prisma/client";
import { findListItems, updateIsAnnualReview } from "server/models/listItem";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { getLatestReminderAuditEvent } from "./helpers";
import { startOfDay } from "date-fns";
import { processAnnualReviewEmails } from "./helpers.annualReview";
import { processUnpublishEmails } from "./helpers.unpublish";

export async function processList(list: List, listItemsForList: ListItemWithHistory[]) {
  if (!listItemsForList.length) {
    logger.info(`No list items found for list ${list.id}`);
    return;
  }
  const annualReviewKeyDates = list.jsonData.currentAnnualReview?.keyDates.annualReview;
  const unpublishedKeyDates = list.jsonData.currentAnnualReview?.keyDates.unpublished;
  const annualReviewRef = list.jsonData.currentAnnualReview?.reference;
  if (!annualReviewRef) {
    logger.info(`Annual review reference not found in currentAnnualReview field for list ${list.id}`);
    return;
  }
  // get the most recent audit record to determine if the email has already been sent for the respective milestones
  const audit = await getLatestReminderAuditEvent(annualReviewRef, "list");
  const listItemAudit = await getLatestReminderAuditEvent(annualReviewRef, "listItem");

  const today = startOfDay(new Date());
  const processListLogger = logger.child({ listId: list.id, method: "processList" });
  processListLogger.info(
    `Checking annual review key dates for list id ${
      list.id
    } against today date ${today.toISOString()} - ${JSON.stringify(annualReviewKeyDates)}`
  );
  // process annual review emails
  const hasProcessedAnnualReviewEmail = await processAnnualReviewEmails(
    list,
    listItemsForList,
    audit as Audit,
    today,
    annualReviewKeyDates as AnnualReviewKeyDates
  );
  if (hasProcessedAnnualReviewEmail) {
    return;
  }

  logger.debug(
    `Annual review key dates for list ${
      list.id
    } don't match against today date ${today.toISOString()} - ${JSON.stringify(annualReviewKeyDates)}`
  );

  // email the posts and providers if today = one of the annual review milestone date
  const uncompletedListItems = listItemsForList.filter((listItem: ListItem) => {
    return listItem.isAnnualReview && listItem.status === "OUT_WITH_PROVIDER";
  });

  await processUnpublishEmails(
    list,
    uncompletedListItems,
    audit as Audit,
    listItemAudit as Audit,
    today,
    annualReviewKeyDates as AnnualReviewKeyDates,
    unpublishedKeyDates as UnpublishedKeyDates
  );
}

export async function updateIsAnnualReviewForListItems(
  listItems: ListItemWithHistory[],
  list: List,
  event: ListItemEvent,
  eventName: AuditListItemEventName
): Promise<ListItemWithHistory[]> {
  if (listItems.length === 0) {
    logger.info(`No List items found for list ${list.id}`);
    return [];
  }
  const updatedListItems: Result<ListItemWithHistory[]> = await updateIsAnnualReview(
    list,
    listItems,
    event,
    eventName,
    AuditEvent.REMINDER
  );

  if (updatedListItems.error) {
    logger.info(`Unable to update list items and email providers for annual review start`);
    return [];
  }
  if (!updatedListItems.result?.length) {
    logger.info(`No list items were updated for annual review start`);
    return [];
  }
  if (updatedListItems.result.length < listItems.length) {
    const listItemsNotUpdated = listItems.filter((listItem) => {
      // @ts-ignore
      return !updatedListItems.result.map((updatedListItem) => updatedListItem.id).includes(listItem.id);
    });
    logger.error(
      `List items ${listItemsNotUpdated.map((listItem) => listItem.id)} were not updated for annual review start`
    );
  }
  return updatedListItems.result;
}

async function processAnnualReview(): Promise<void> {
  const listResult = await findListsWithCurrentAnnualReview();

  // validate list results
  if (!listResult.result?.length) {
    logger.info(`No lists found with current annual review populated`);
    return;
  }
  const listsWithCurrentAnnualReview = listResult.result;
  const listItemIds = listsWithCurrentAnnualReview.flatMap((list) => {
    const listItemIds = list?.jsonData?.currentAnnualReview?.eligibleListItems;
    return !listItemIds ? [] : listItemIds.map((itemId) => itemId);
  });

  const listIds = listsWithCurrentAnnualReview.map((list) => list.id);
  logger.debug(`Found ${listResult.result?.length} Lists [${listIds}] with current annual review populated`);

  if (!listItemIds?.length) {
    logger.info(`No list item ids eligible for annual review found for lists ${listIds}`);
    return;
  }
  // get list items eligible for annual review for all lists
  const listItemsResult = await findListItems({ listItemIds });
  if (listItemsResult.error ?? !listItemsResult.result.length) {
    logger.info(`No list items found for any of the list Ids ${listIds}`);
    return;
  }
  const { result: listItems } = listItemsResult;
  for (const list of listsWithCurrentAnnualReview) {
    const listItemsForList = listItems.filter((listItem) => listItem.listId === list.id);
    await processList(list, listItemsForList);
  }
}

processAnnualReview()
  .then((r) => {
    logger.info(`Annual review worker finished`);
    process.exit(0);
  })
  .catch((r: Error) => {
    logger.error(`Annual review scheduler failed due to ${r.message}, ${r.stack}`);
    process.exit(1);
  });
