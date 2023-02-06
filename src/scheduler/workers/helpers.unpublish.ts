import {
  AnnualReviewKeyDates,
  Audit,
  List,
  ListItemAnnualReviewProviderReminderType,
  ListItemUnpublishedPostReminderType,
  ListItemUnpublishedProviderReminderType,
  UnpublishedKeyDates,
} from "server/models/types";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { endOfDay, isBefore, isSameDay, isWithinInterval, subDays } from "date-fns";
import {
  createAnnualReviewProviderUrl,
  formatDate,
  isEmailSentBefore,
  processPostEmailsForList,
  processProviderEmailsForListItems,
} from "./helpers";
import { logger } from "server/services/logger";
import { sendUnpublishedProviderEmail } from "server/services/govuk-notify";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { lowerCase, startCase } from "lodash";
import { updateIsAnnualReviewForListItems } from "./main";
import { ListItemEvent } from "@prisma/client";

export async function processUnpublishEmails(
  list: List,
  uncompletedListItems: ListItemWithHistory[],
  audit: Audit,
  listItemAudit: Audit,
  today: Date,
  annualReviewKeyDates: AnnualReviewKeyDates,
  unpublishedKeyDates: UnpublishedKeyDates
) {
  if (
    isBefore(
      subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? "")), 1),
      new Date(unpublishedKeyDates?.PROVIDER_FIVE_WEEKS ?? "")
    ) &&
    isWithinInterval(today, {
      start: new Date(unpublishedKeyDates?.PROVIDER_FIVE_WEEKS ?? ""),
      end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? "")), 1),
    })
  ) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishFiveWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishFiveWeekProviderEmail");
    }
    return;
  }

  if (
    isBefore(
      subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? "")), 1),
      new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? "")
    ) &&
    isWithinInterval(today, {
      start: new Date(unpublishedKeyDates?.PROVIDER_FOUR_WEEKS ?? ""),
      end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? "")), 1),
    })
  ) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishFourWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishFourWeekProviderEmail");
    }
    return;
  }

  if (
    isBefore(
      subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? "")), 1),
      new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? "")
    ) &&
    isWithinInterval(today, {
      start: new Date(unpublishedKeyDates?.PROVIDER_THREE_WEEKS ?? ""),
      end: subDays(endOfDay(new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? "")), 1),
    })
  ) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishThreeWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishThreeWeekProviderEmail");
    }
    return;
  }

  if (
    isBefore(
      subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_WEEK ?? "")), 1),
      new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? "")
    ) &&
    isWithinInterval(today, {
      start: new Date(unpublishedKeyDates?.PROVIDER_TWO_WEEKS ?? ""),
      end: subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_WEEK ?? "")), 1),
    })
  ) {
    const isEmailSent = isEmailSentBefore(listItemAudit, "sendUnpublishTwoWeekProviderEmail");
    if (!isEmailSent) {
      await processProviderEmailsForListItems(list, uncompletedListItems, "sendUnpublishTwoWeekProviderEmail");
    }
    return;
  }

  if (
    isBefore(
      subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_DAY ?? "")), 1),
      new Date(unpublishedKeyDates?.ONE_WEEK ?? "")
    ) &&
    isWithinInterval(today, {
      start: new Date(unpublishedKeyDates?.ONE_WEEK ?? ""),
      end: subDays(endOfDay(new Date(unpublishedKeyDates?.ONE_DAY ?? "")), 1),
    })
  ) {
    // email posts to notify of annual review start
    let isEmailSent = isEmailSentBefore(audit, "sendUnpublishOneWeekPostEmail");
    if (!isEmailSent) {
      await processPostEmailsForList(
        list,
        "POST_ONE_WEEK",
        "sendUnpublishOneWeekPostEmail",
        true,
        uncompletedListItems
      );
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
    const unpublishedListItems = uncompletedListItems.map((listItem) => {
      listItem.status = "UNPUBLISHED";
      listItem.isAnnualReview = false;
      return listItem;
    })
    const updatedListItems = await updateIsAnnualReviewForListItems(unpublishedListItems, list, ListItemEvent.UNPUBLISHED, "unpublish");
    await processProviderEmailsForListItems(list, updatedListItems, "sendUnpublishedProviderEmail", true);
    return;
  }

  logger.info(`Unpublish key dates don't match`);
}

export async function emailProviderForUnpublishKeyDates(
  list: List,
  listItem: ListItemWithHistory,
  reminderType?:
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedProviderReminderType
    | ListItemUnpublishedPostReminderType
) {
  const annualReviewProviderUrl = createAnnualReviewProviderUrl(listItem);
  const unpublishDate = new Date(list.jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
  const unpublishDateString = formatDate(unpublishDate);
  return await sendUnpublishedProviderEmail(
    reminderType as ListItemUnpublishedProviderReminderType,
    (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
    lowerCase(startCase(listItem.type)),
    list?.country?.name ?? "",
    (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
    unpublishDateString,
    annualReviewProviderUrl
  );
}
