import { endOfDay, isSameDay, isWithinInterval, startOfDay, subDays } from "date-fns";
import { lowerCase, startCase } from "lodash";
import { AuditEvent, Event, ListItemEvent } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";
import type { SendEmailResponse } from "notifications-node-client";

import { findListItems, findListsWithCurrentAnnualReview, updateIsAnnualReview } from "scheduler/dbHelpers";
import { logger } from "scheduler/logger";
import type {
  List,
  ListAnnualReviewPostReminderType,
  ListItemAnnualReviewProviderReminderType,
  ListItemWithHistory,
} from "shared/types";
import type { MilestoneTillAnnualReview } from "../../batch/helpers";
import { formatDate, isEmailSentBefore } from "./helpers";
import { createAnnualReviewProviderUrl } from "scheduler/workers/createAnnualReviewProviderUrl";
import {
  sendAnnualReviewPostEmail,
  sendAnnualReviewProviderEmail,
} from "scheduler/workers/processListsBeforeAndDuringStart/govukNotify";
import { findAllReminderEvents } from "./audit";
import type { BaseDeserialisedWebhookData } from "shared/deserialiserTypes";
import { addReminderEvent } from "../helpers/addReminderEvent";

async function processPostEmailsForList(
  list: List,
  milestoneTillAnnualReview: MilestoneTillAnnualReview,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType
) {
  // Check if sent before
  if (!list.jsonData.users) {
    logger.info(
      `Unable to send email to post for ${milestoneTillAnnualReview}. No users identified for List ${list.id}.`
    );
    return;
  }

  const postEmailPromises = list.jsonData.users.map(async (publisherEmail) => {
    return await sendAnnualReviewPostEmail(
      milestoneTillAnnualReview,
      publisherEmail,
      lowerCase(startCase(list.type)),
      list?.country?.name ?? "",
      formatDate(list.nextAnnualReviewStartDate)
    );
  });

  const sendResult = await Promise.allSettled(postEmailPromises);
  const emailSent = sendResult.find((result) => result.status === "fulfilled" && result.value);

  if (!emailSent) {
    logger.error(
      `processPostEmailsForList: Unable to send annual review email to post contacts ${list.jsonData.users} for list ${list.id} ${milestoneTillAnnualReview} before annual review start`
    );
    return;
  }
  logger.info(`Annual review email sent to post contacts ${list.jsonData.users}`);

  await prisma.audit.create({
    data: {
      auditEvent: AuditEvent.REMINDER,
      type: "list",
      jsonData: {
        eventName: "reminder",
        annualReviewRef: list.jsonData.currentAnnualReview?.reference,
        reminderType,
      },
    },
  });
}

async function sendAnnualReviewStartEmail(list: List, listItem: ListItemWithHistory) {
  const annualReviewProviderUrl = createAnnualReviewProviderUrl(listItem);
  const unpublishDate = new Date(list.jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
  const unpublishDateString = formatDate(unpublishDate);

  const providerEmailResult = await sendAnnualReviewProviderEmail(
    (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
    lowerCase(startCase(listItem.type)),
    list?.country?.name ?? "",
    (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
    unpublishDateString,
    annualReviewProviderUrl
  );
  return providerEmailResult;
}

async function processProviderEmailsForListItems(list: List, listItems: ListItemWithHistory[]) {
  for (const listItem of listItems) {
    const annualReviewRef = list.jsonData.currentAnnualReview?.reference;
    let isEmailSent = false;

    // get the most recent audit record to determine if the email has already been sent for the start milestone
    if (annualReviewRef) {
      const { result: events } = await findAllReminderEvents(annualReviewRef, listItem.id);
      if (events?.length) {
        const audit = events.pop();
        isEmailSent = isEmailSentBefore(audit, "sendStartedProviderEmail");
      }
    }

    // email the provider and add an audit record
    if (!isEmailSent) {
      const { result } = await sendAnnualReviewStartEmail(list, listItem);
      const annualReviewRef = list.jsonData.currentAnnualReview?.reference;

      if (result) {
        await addReminderEvent(listItem.id, result as SendEmailResponse, ["sendStartedProviderEmail"], annualReviewRef);
      }
    }
  }
}

async function getLatestReminderAuditEvent(annualReviewRef: string) {
  const { result: events } = await findAllReminderEvents(annualReviewRef);
  let audit: Event | undefined;
  if (events?.length) {
    audit = events.pop() as Event;
  }
  return audit;
}

export async function processList(list: List, listItemsForList: ListItemWithHistory[]) {
  if (!listItemsForList.length) {
    logger.info(`No list items found for list ${list.id}`);
    return;
  }
  const annualReviewKeyDates = list.jsonData.currentAnnualReview?.keyDates.annualReview;
  const annualReviewRef = list.jsonData.currentAnnualReview?.reference;
  if (!annualReviewRef) {
    logger.info(`Annual review reference not found in currentAnnualReview field for list ${list.id}`);
    return;
  }
  // get the most recent audit record to determine if the email has already been sent for the respective milestones
  const audit = await getLatestReminderAuditEvent(annualReviewRef);
  const listItemAudit = await getLatestReminderAuditEvent(annualReviewRef);
  let isEmailSent = false;

  const today = startOfDay(new Date());
  const processListLogger = logger.child({ listId: list.id, method: "processList" });
  processListLogger.info(
    `Checking annual review key dates for list id ${
      list.id
    } against today date ${today.toISOString()} - ${JSON.stringify(annualReviewKeyDates)}`
  );

  if (
    isWithinInterval(today, {
      start: new Date(annualReviewKeyDates?.POST_ONE_MONTH ?? ""),
      end: subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? "")), 1),
    })
  ) {
    isEmailSent = isEmailSentBefore(audit as Event, "sendOneMonthPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "POST_ONE_MONTH", "sendOneMonthPostEmail");
    }
    return;
  }
  if (
    isWithinInterval(today, {
      start: new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? ""),
      end: subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_DAY ?? "")), 1),
    })
  ) {
    isEmailSent = isEmailSentBefore(audit, "sendOneWeekPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "POST_ONE_WEEK", "sendOneWeekPostEmail");
    }
    return;
  }
  if (isSameDay(today, new Date(annualReviewKeyDates?.POST_ONE_DAY ?? ""))) {
    isEmailSent = isEmailSentBefore(audit, "sendOneDayPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "POST_ONE_DAY", "sendOneDayPostEmail");
    }
    return;
  }
  if (isSameDay(new Date(annualReviewKeyDates?.START ?? ""), today)) {
    // email posts to notify of annual review start
    isEmailSent = isEmailSentBefore(audit, "sendStartedPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(list, "START", "sendStartedPostEmail");
    }

    // update ListItem.isAnnualReview if today = the START milestone date
    // email providers to notify of annual review start
    isEmailSent = isEmailSentBefore(listItemAudit, "sendStartedProviderEmail");
    if (isEmailSent) {
      logger.info(`Annual review started email has already been sent to providers for list ${list.id}`);
      return;
    }
    const updatedListItems = await updateIsAnnualReviewForListItems(listItemsForList, list);
    await processProviderEmailsForListItems(list, updatedListItems);
    return;
  }
  logger.debug(
    `Annual review key dates for list ${
      list.id
    } don't match against today date ${today.toISOString()} - ${JSON.stringify(annualReviewKeyDates)}`
  );
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
    "startAnnualReview"
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
      return updatedListItems.result!.map((updatedListItem) => updatedListItem.id).includes(listItem.id);
    });
    logger.error(
      `updateIsAnnualReviewForListItems: List items ${listItemsNotUpdated
        .map((listItem) => listItem.id)
        .join(
          ", "
        )} were not updated for annual review because they do not have a correct listItem id. This will run again tomorrow.`
    );
  }
  return updatedListItems.result;
}

export async function processAnnualReview(): Promise<void> {
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
