import { findListsWithCurrentAnnualReview } from "server/models/list";
import { logger } from "server/services/logger";
import {
  AnnualReviewKeyDates,
  Audit,
  List,
  ListAnnualReviewPostReminderType,
  ListItemAnnualReviewProviderReminderType,
  ListItemUnpublishedPostReminderType,
  ListItemUnpublishedProviderReminderType, UnpublishedKeyDates
} from "server/models/types";
import { lowerCase, startCase } from "lodash";
import {
  sendAnnualReviewPostEmail,
  sendAnnualReviewProviderEmail,
  sendUnpublishedPostEmail,
  sendUnpublishedProviderEmail
} from "server/services/govuk-notify";
import { findAuditEvents, recordListItemEvent } from "server/models/audit";
import { AuditEvent, ListItem, ListItemEvent } from "@prisma/client";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { findListItems, updateIsAnnualReview } from "server/models/listItem";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { MilestoneTillAnnualReview, MilestoneTillUnpublish } from "../batch/helpers";
import { createAnnualReviewProviderUrl, formatDate, isEmailSentBefore } from "../helpers";
import { endOfDay, isSameDay, isWithinInterval, startOfDay, subDays } from "date-fns";

async function processPostEmailsForList(
  list: List,
  milestoneTillAnnualReview: MilestoneTillAnnualReview | MilestoneTillUnpublish,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType | ListItemUnpublishedProviderReminderType | ListItemUnpublishedPostReminderType,
  isUnpublishEmail: boolean = false,
  uncompletedlistItems: ListItemWithHistory[] = [],
) {
  // Check if sent before
  let emailSent = false;
  if (!list.jsonData.users) {
    logger.info(
      `Unable to send email to post for ${milestoneTillAnnualReview}. No users identified for List ${list.id}.`
    );
    return;
  }
  for (const publisherEmail of list.jsonData.users) {
    if (isUnpublishEmail) {
      const { result } = await sendUnpublishedPostEmail(
        reminderType as ListItemUnpublishedPostReminderType,
        publisherEmail,
        lowerCase(startCase(list.type)),
        list?.country?.name ?? "",
        `${uncompletedlistItems.length}`);
      if (!emailSent && result) {
        emailSent = result;
      }
    } else {
      const { result } = await sendAnnualReviewPostEmail(
        milestoneTillAnnualReview as MilestoneTillAnnualReview,
        publisherEmail,
        lowerCase(startCase(list.type)),
        list?.country?.name ?? "",
        formatDate(list.nextAnnualReviewStartDate)
      );
      if (!emailSent && result) {
        emailSent = result;
      }
    }
  }
  // @todo the following code would be used if using Promise.allSettled
  // const sendResult = await Promise.allSettled(postEmailPromises);
  // const emailSent = sendResult.find((result) => result.status === "fulfilled" && result.value);

  if (!emailSent) {
    logger.error(
      `Unable to send annual review email to post contacts ${list.jsonData.users} for list ${list.id} ${milestoneTillAnnualReview} before annual review start`
    );
    return;
  }
  logger.info(`Annual review email sent to post contacts ${list.jsonData.users}`);

  await recordListItemEvent(
    {
      eventName: "reminder",
      itemId: list.id,
      annualReviewRef: list.jsonData.currentAnnualReview?.reference,
      reminderType,
    },
    AuditEvent.REMINDER,
    "list"
  );
}

async function emailProvider(list: List, listItem: ListItemWithHistory, reminderType?: ListItemAnnualReviewProviderReminderType | ListItemUnpublishedProviderReminderType | ListItemUnpublishedPostReminderType, isUnpublishProviderEmail?: boolean) {
  const annualReviewProviderUrl = createAnnualReviewProviderUrl(listItem);
  const unpublishDate = new Date(list.jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
  const unpublishDateString = formatDate(unpublishDate);
  let providerEmailResult;
  if (isUnpublishProviderEmail) {
    providerEmailResult = await sendUnpublishedProviderEmail(
      reminderType as ListItemUnpublishedProviderReminderType,
      (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
      lowerCase(startCase(listItem.type)),
      list?.country?.name ?? "",
      (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
      unpublishDateString,
      annualReviewProviderUrl
    );
  } else {
    providerEmailResult = await sendAnnualReviewProviderEmail(
      (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
      lowerCase(startCase(listItem.type)),
      list?.country?.name ?? "",
      (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
      formatDate(unpublishDate),
      annualReviewProviderUrl
    );
  }
  return providerEmailResult;
}

async function processProviderEmailsForListItems(
  list: List,
  listItems: ListItemWithHistory[],
  reminderType: ListItemAnnualReviewProviderReminderType | ListItemUnpublishedProviderReminderType | ListItemUnpublishedPostReminderType,
  isUnpublishProviderEmail: boolean = false,
) {
  const annualReviewRef = list.jsonData.currentAnnualReview?.reference;

  for (const listItem of listItems) {
    let isEmailSent = false;

    // get the most recent audit record to determine if the email has already been sent for the start milestone
    if (annualReviewRef) {
      const { result: events } = await findAuditEvents(annualReviewRef, "REMINDER", "listItem", listItem.id);
      if (events?.length) {
        const audit = events.pop();
        isEmailSent = isEmailSentBefore(audit as Audit, reminderType);
      }
    }

    // email the provider and add an audit record
    if (!isEmailSent) {
      const providerEmailResult = await emailProvider(list, listItem, reminderType, isUnpublishProviderEmail);

      if (providerEmailResult.result) {
        await recordListItemEvent(
          {
            eventName: "reminder",
            itemId: listItem.id,
            annualReviewRef,
            reminderType,
          },
          AuditEvent.REMINDER,
          "listItem"
        );
      }
    }
  }
}

async function getLatestReminderAuditEvent(annualReviewRef: string, auditType: "user" | "list" | "listItem") {
  const { result: events } = await findAuditEvents(annualReviewRef, "REMINDER", auditType);
  let audit: Audit | undefined;
  if (events?.length) {
    audit = events.pop() as Audit;
  }
  return audit;
}

async function processPostEmail(
  list: List,
  audit: Audit,
  milestoneTillAnnualReview: MilestoneTillAnnualReview | MilestoneTillUnpublish,
  intervalDate: Date,
  start: Date,
  end: Date,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType | ListItemUnpublishedProviderReminderType | ListItemUnpublishedPostReminderType,
): Promise<boolean> {
  logger.info(`Checking if ${reminderType} email should be sent [today: ${intervalDate}, start: ${start}, end: ${end}`);
  if (isWithinInterval(intervalDate, { start, end })) {
    const isEmailSent = isEmailSentBefore(audit, reminderType);
    if (!isEmailSent) {
      await processPostEmailsForList(list, milestoneTillAnnualReview, reminderType);
    }
    return true;
  }
  return false;
}

async function processPostProviderEmail(
  list: List,
  listItems: ListItemWithHistory[],
  audit: Audit,
  milestoneTillAnnualReview: MilestoneTillAnnualReview | MilestoneTillUnpublish,
  intervalDate: Date,
  start: Date,
  end: Date,
  postReminderType: ListAnnualReviewPostReminderType | ListItemUnpublishedPostReminderType,
  providerReminderType: ListItemAnnualReviewProviderReminderType | ListItemUnpublishedProviderReminderType,
  listItemAudit?: Audit
): Promise<boolean> {

  if (isWithinInterval(intervalDate, { start, end })) {
    let isEmailSent = isEmailSentBefore(audit, postReminderType);
    if (!isEmailSent) {
      await processPostEmailsForList(list, milestoneTillAnnualReview, postReminderType);
    }

    isEmailSent = isEmailSentBefore(listItemAudit as Audit, providerReminderType);
    if (isEmailSent) {
      logger.info(`${providerReminderType} email has already been sent to providers for list ${list.id}`);
      return true;
    }
    const updatedListItems = await updateIsAnnualReviewForListItems(listItems, list);
    await processProviderEmailsForListItems(list, updatedListItems, providerReminderType);
    return true;
  }
  return false;
}

export async function processAnnualReviewEmails(list: List, listItemsForList: ListItemWithHistory[], audit: Audit, today: Date, annualReviewKeyDates: AnnualReviewKeyDates): Promise<boolean> {
  if (await processPostEmail(list,
    audit,
    "POST_ONE_MONTH",
    today,
    new Date(annualReviewKeyDates?.POST_ONE_MONTH ?? ""),
    subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? "")), 1),
    "sendOneMonthPostEmail"
  )) {
    return true;
  }

  if (await processPostEmail(list,
    audit,
    "POST_ONE_WEEK",
    today,
    new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? ""),
    subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_DAY ?? "")), 1),
    "sendOneWeekPostEmail"
  )) {
    return true;
  }

  if (await processPostEmail(list,
    audit,
    "POST_ONE_DAY",
    today,
    new Date(annualReviewKeyDates?.POST_ONE_DAY ?? ""),
    endOfDay(new Date(annualReviewKeyDates?.POST_ONE_DAY ?? "")),
    "sendOneDayPostEmail"
  )) {
    return true;
  }

  if (await processPostProviderEmail(list,
    listItemsForList,
    audit,
    "START",
    today,
    new Date(annualReviewKeyDates?.START ?? ""),
    endOfDay(new Date(annualReviewKeyDates?.START ?? "")),
    "sendStartedPostEmail",
    "sendStartedProviderEmail",
  )) {
    return true;
  }
  return false;
}

async function processUnpublishEmails(list: List, uncompletedListItems: ListItemWithHistory[], audit: Audit, listItemAudit: Audit, today: Date, annualReviewKeyDates: AnnualReviewKeyDates, unpublishedKeyDates: UnpublishedKeyDates) {
  if (isWithinInterval(today, {
    start: new Date(unpublishedKeyDates?.PROVIDER_FIVE_WEEKS ?? ""),
    end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? "")), 1),
  })) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishFiveWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishFiveWeekProviderEmail");
    }
    return;
  }

  if (isWithinInterval(today, {
    start: new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? ""),
    end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? "")), 1),
  })) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishFourWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishFourWeekProviderEmail");
    }
    return;
  }

  if (isWithinInterval(today, {
    start: new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? ""),
    end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? "")), 1),
  })) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishThreeWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishThreeWeekProviderEmail");
    }
    return;
  }

  if (isWithinInterval(today, {
    start: new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? ""),
    end: subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_WEEK ?? "")), 1),
  })) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishTwoWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishTwoWeekProviderEmail");
    }
    return;
  }

  if (isWithinInterval(today, {
    start: new Date(unpublishedKeyDates?.ONE_WEEK ?? ""),
    end: subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_DAY ?? "")), 1),
  })) {
    // email posts to notify of annual review start
    let isEmailSent = isEmailSentBefore(audit, "sendUnpublishOneWeekPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "POST_ONE_WEEK", "sendUnpublishOneWeekPostEmail", true, uncompletedListItems);
    }

    isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishOneWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishOneWeekProviderEmail");
    }
    return;
  }

  if (isSameDay(new Date(unpublishedKeyDates?.ONE_DAY ?? ""), today)) {
    // email posts to notify of annual review start
    let isEmailSent = isEmailSentBefore(audit, "sendUnpublishOneDayPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "POST_ONE_DAY", "sendUnpublishOneDayPostEmail", true, uncompletedListItems);
    }

    // update ListItem.isAnnualReview if today = the START milestone date
    // email providers to notify of annual review start
    isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishOneDayProviderEmail");
    if (isEmailSent) {
      logger.info(`UnpublishOneDayProviderEmail has already been sent to providers for list ${list.id}`);
      return;
    }
    await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishOneDayProviderEmail", true);
    return;
  }

  if (isSameDay(new Date(unpublishedKeyDates?.UNPUBLISH ?? ""), today)) {
    // email posts to notify of annual review start
    let isEmailSent = isEmailSentBefore(audit, "sendUnpublishedPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "UNPUBLISH", "sendUnpublishedPostEmail", true, uncompletedListItems);
    }

    // update ListItem.isAnnualReview if today = the START milestone date
    // email providers to notify of annual review start
    isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishedProviderEmail");
    if (isEmailSent) {
      logger.info(`UnpublishedProviderEmail has already been sent to providers for list ${list.id}`);
      return;
    }
    // const updatedListItems = await updateIsAnnualReviewForListItems(listItemsForList, list);
    // @todo unpublish list items here
    await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishedProviderEmail", true);
    // return
  }
}

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
  const hasProcessedAnnualReviewEmail = await processAnnualReviewEmails(list, listItemsForList, audit as Audit, today, annualReviewKeyDates as AnnualReviewKeyDates);
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
    return listItem.isAnnualReview;
  });

  await processUnpublishEmails(list, uncompletedListItems, audit as Audit, listItemAudit as Audit, today, annualReviewKeyDates as AnnualReviewKeyDates, unpublishedKeyDates as UnpublishedKeyDates);
}

export async function updateIsAnnualReviewForListItems(
  listItems: ListItemWithHistory[],
  list: List
): Promise<ListItemWithHistory[]> {
  if (listItems.length === 0) {
    logger.info(`No List items found for list ${list.id}`);
    return [];
  }
  const updatedListItems: Result<ListItemWithHistory[]> = await updateIsAnnualReview(
    list,
    listItems,
    ListItemEvent.ANNUAL_REVIEW_STARTED,
    "startAnnualReview",
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
