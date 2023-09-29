import { lowerCase, startCase } from "lodash";
import { AuditEvent, ListItemEvent } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";
import type { SendEmailResponse } from "notifications-node-client";

import { findListItems, findListsWithCurrentAnnualReview, updateIsAnnualReview } from "scheduler/dbHelpers";
import { logger } from "scheduler/logger";
import type { List, ListItemWithHistory } from "shared/types";
import { formatDate, shouldSendToPost, shouldSendToProvider } from "./helpers";
import { createAnnualReviewProviderUrl } from "scheduler/workers/createAnnualReviewProviderUrl";
import { sendAnnualReviewPostEmail, sendAnnualReviewProviderEmail } from "./govukNotify";
import type { BaseDeserialisedWebhookData } from "shared/deserialiserTypes";
import { addReminderEvent } from "../helpers/addReminderEvent";
import type { RemindersBeforeStartDate } from "scheduler/batch/helpers";
import { getEmailTypeForToday } from "./getEmailTypeForToday";

async function processPostEmailsForList(list: List, reminderType: RemindersBeforeStartDate) {
  if (!list.users) {
    logger.warn(`Unable to send email to post for ${reminderType}. No users identified for List ${list.id}.`);
    return;
  }
  const reference = list.jsonData.currentAnnualReview?.reference;

  const postEmailPromises = list.users.map(async (user) => {
    return await sendAnnualReviewPostEmail(
      reminderType,
      user.email,
      lowerCase(startCase(list.type)),
      list?.country?.name ?? "",
      formatDate(list.nextAnnualReviewStartDate),
      reference
    );
  });

  try {
    const { result, error } = await Promise.any(postEmailPromises);
    if (error) {
      throw error;
    }

    logger.info(`Annual review email  ${reminderType} sent to post contacts ${list.users}`);

    await prisma.audit.create({
      data: {
        auditEvent: AuditEvent.REMINDER,
        type: "list",
        annualReviewEmailType: reminderType,
        jsonData: {
          eventName: "reminder",
          annualReviewRef: list.jsonData.currentAnnualReview?.reference,
          response: JSON.stringify(result),
        },
      },
    });
  } catch (e) {
    logger.error(
      `processPostEmailsForList: Unable to send annual review email to post contacts ${list.users.map(
        (user) => user.email
      )} for list ${list.id} ${reminderType} before annual review start`
    );
  }
}

async function sendAnnualReviewStartEmail(list: List, listItem: ListItemWithHistory) {
  const annualReviewProviderUrl = createAnnualReviewProviderUrl(listItem);
  const unpublishDate = new Date(list.jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
  const unpublishDateString = formatDate(unpublishDate);
  const reference = list.jsonData.currentAnnualReview?.reference;

  const providerEmailResult = await sendAnnualReviewProviderEmail(
    (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
    lowerCase(startCase(listItem.type)),
    list?.country?.name ?? "",
    (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
    unpublishDateString,
    annualReviewProviderUrl,
    reference
  );
  return providerEmailResult;
}

async function processProviderEmailsForListItems(list: List, listItems: ListItemWithHistory[]) {
  /**
   * listItems should come from `list.jsonData.currentAnnualReview.eligibleListItems`.
   */
  for (const listItem of listItems) {
    const annualReviewReference = list.jsonData.currentAnnualReview?.reference;

    const shouldSendStartedEmail = await shouldSendToProvider("started", listItem.id, annualReviewReference);

    if (!shouldSendStartedEmail) {
      return;
    }

    const { result, error } = await sendAnnualReviewStartEmail(list, listItem);

    if (error) {
      logger.error(`started failed to send to ${listItem.id}`);
      return;
    }

    if (result) {
      await addReminderEvent({
        id: listItem.id,
        response: result as SendEmailResponse,
        notes: ["started"],
        reference: annualReviewReference,
        emailType: "started",
      });
    }
  }
}

export async function processList(list: List, listItemsForList: ListItemWithHistory[]) {
  const { currentAnnualReview } = list.jsonData;

  const annualReviewKeyDates = currentAnnualReview?.keyDates.annualReview;
  const annualReviewReference = currentAnnualReview?.reference;

  const processListLogger = logger.child({ listId: list.id, method: "processList", keyDates: annualReviewKeyDates });

  if (!annualReviewReference) {
    logger.info(`Annual review reference not found in currentAnnualReview field for list ${list.id}`);
    return;
  }

  const emailTypeForToday: RemindersBeforeStartDate | undefined = getEmailTypeForToday(currentAnnualReview?.keyDates);

  if (!emailTypeForToday) {
    processListLogger.info(`No email type found for today for ${list.id}`);
    return;
  }

  processListLogger.info(`Email type for today is ${emailTypeForToday} for list ${list.id}`);

  const shouldSendEmailToPost = await shouldSendToPost(emailTypeForToday, annualReviewReference);

  if (shouldSendEmailToPost) {
    await processPostEmailsForList(list, emailTypeForToday);
  }

  if (emailTypeForToday === "started") {
    const updatedListItems = await updateIsAnnualReviewForListItems(listItemsForList, list);
    await processProviderEmailsForListItems(list, updatedListItems);
  }
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
    logger.info(`processAnnualReview: No lists found with current annual review populated`);
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
