import {
  Audit,
  List,
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
  ListItemEventJsonData,
  ListItemUnpublishedPostReminderType,
  ListItemUnpublishedProviderReminderType,
} from "server/models/types";
import { logger } from "server/services/logger";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { findAuditEvents, recordListItemEvent } from "server/models/audit";
import { emailProviderForAnnualReviewKeyDates } from "./helpers.annualReview";
import { AuditEvent, ListItemEvent } from "@prisma/client";
import { MilestoneTillAnnualReview, MilestoneTillUnpublish } from "../batch/helpers";
import { sendAnnualReviewPostEmail, sendUnpublishedPostEmail } from "server/services/govuk-notify";
import { lowerCase, startCase } from "lodash";
import { isBefore, isWithinInterval } from "date-fns";
import { updateIsAnnualReviewForListItems } from "./main";
import { emailProviderForUnpublishKeyDates } from "./helpers.unpublish";

export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString("en-gb", options);
}

export function createAnnualReviewProviderUrl(listItem: ListItemWithHistory): string {
  const protocol = isLocalHost ? "http" : "https";
  const host = `${protocol}://${SERVICE_DOMAIN}`;
  const path = `/annual-review/confirm/${listItem.reference}`;

  return `${host}${path}`;
}

export function isEmailSentBefore(
  audit: Audit | undefined,
  reminderType:
    | ListAnnualReviewPostReminderType
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedProviderReminderType
    | ListItemUnpublishedPostReminderType
): boolean {
  if (!audit || !audit.jsonData) {
    return false;
  }
  const subsequentEmailsForReminderType = {
    // annual review
    sendOneMonthPostEmail: [
      "sendOneMonthPostEmail",
      "sendOneWeekPostEmail",
      "sendOneDayPostEmail",
      "sendStartPostEmail",
    ],
    sendOneWeekPostEmail: ["sendOneWeekPostEmail", "sendOneDayPostEmail", "sendStartedPostEmail"],
    sendOneDayPostEmail: ["sendOneDayPostEmail", "sendStartedPostEmail"],
    sendStartedPostEmail: ["sendStartedPostEmail"],
    sendStartedProviderEmail: ["sendStartedProviderEmail"],

    // unpublish post
    sendUnpublishOneWeekPostEmail: [
      "sendUnpublishOneWeekPostEmail",
      "sendUnpublishOneDayPostEmail",
      "sendUnpublishedPostEmail",
    ],
    sendUnpublishOneDayPostEmail: ["sendUnpublishOneDayPostEmail", "sendUnpublishedPostEmail"],
    sendUnpublishedPostEmail: ["sendUnpublishedPostEmail"],

    // unpublish provider
    sendUnpublishFiveWeekProviderEmail: [
      "sendUnpublishFiveWeekProviderEmail",
      "sendUnpublishFourWeekProviderEmail",
      "sendUnpublishThreeWeekProviderEmail",
      "sendUnpublishTwoWeekProviderEmail",
      "sendUnpublishOneWeekProviderEmail",
      "sendUnpublishOneDayProviderEmail",
      "sendUnpublishedProviderEmail",
    ],
    sendUnpublishFourWeekProviderEmail: [
      "sendUnpublishFourWeekProviderEmail",
      "sendUnpublishThreeWeekProviderEmail",
      "sendUnpublishTwoWeekProviderEmail",
      "sendUnpublishOneWeekProviderEmail",
      "sendUnpublishOneDayProviderEmail",
      "sendUnpublishedProviderEmail",
    ],
    sendUnpublishThreeWeekProviderEmail: [
      "sendUnpublishThreeWeekProviderEmail",
      "sendUnpublishTwoWeekProviderEmail",
      "sendUnpublishOneWeekProviderEmail",
      "sendUnpublishTwoWeekProviderEmail",
      "sendUnpublishOneDayProviderEmail",
      "sendUnpublishedProviderEmail",
    ],
    sendUnpublishTwoWeekProviderEmail: [
      "sendUnpublishTwoWeekProviderEmail",
      "sendUnpublishOneWeekProviderEmail",
      "sendUnpublishOneDayProviderEmail",
      "sendUnpublishedProviderEmail",
    ],
    sendUnpublishOneWeekProviderEmail: [
      "sendUnpublishOneWeekProviderEmail",
      "sendUnpublishOneDayProviderEmail",
      "sendUnpublishedProviderEmail",
    ],
    sendUnpublishOneDayProviderEmail: ["sendUnpublishOneDayProviderEmail", "sendUnpublishedProviderEmail"],
    sendUnpublishedProviderEmail: ["sendUnpublishedProviderEmail"],
  };
  const listEventJsonData = audit.jsonData as ListEventJsonData | ListItemEventJsonData;
  const subsequentEmails: string[] = subsequentEmailsForReminderType[reminderType];
  const reminderHasBeenSent = subsequentEmails?.includes?.(listEventJsonData?.reminderType as string) ?? false;
  if (reminderHasBeenSent) {
    logger.info(`Email has been sent before for ${reminderType} reminder type`);
    return true;
  }
  return false;
}

export async function processProviderEmailsForListItems(
  list: List,
  listItems: ListItemWithHistory[],
  reminderType:
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedProviderReminderType
    | ListItemUnpublishedPostReminderType,
  isUnpublishProviderEmail: boolean = false
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
      let providerEmailResult;
      if (isUnpublishProviderEmail) {
        providerEmailResult = await emailProviderForUnpublishKeyDates(list, listItem, reminderType);
      } else {
        providerEmailResult = await emailProviderForAnnualReviewKeyDates(list, listItem);
      }

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

export async function processPostEmailsForList(
  list: List,
  milestoneTillAnnualReview: MilestoneTillAnnualReview | MilestoneTillUnpublish,
  reminderType:
    | ListAnnualReviewPostReminderType
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedProviderReminderType
    | ListItemUnpublishedPostReminderType,
  isUnpublishEmail: boolean = false,
  uncompletedlistItems: ListItemWithHistory[] = []
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
        `${uncompletedlistItems.length}`
      );
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

export async function getLatestReminderAuditEvent(annualReviewRef: string, auditType: "user" | "list" | "listItem") {
  const { result: events } = await findAuditEvents(annualReviewRef, "REMINDER", auditType);
  let audit: Audit | undefined;
  if (events?.length) {
    audit = events.pop() as Audit;
  }
  return audit;
}

export async function processPostEmail(
  list: List,
  audit: Audit,
  milestoneTillAnnualReview: MilestoneTillAnnualReview | MilestoneTillUnpublish,
  intervalDate: Date,
  start: Date,
  end: Date,
  reminderType:
    | ListAnnualReviewPostReminderType
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedProviderReminderType
    | ListItemUnpublishedPostReminderType
): Promise<boolean> {
  logger.info(`Checking if ${reminderType} email should be sent [today: ${intervalDate}, start: ${start}, end: ${end}`);
  if (isBefore(start, end) && isWithinInterval(intervalDate, { start, end })) {
    const isEmailSent = isEmailSentBefore(audit, reminderType);
    if (!isEmailSent) {
      await processPostEmailsForList(list, milestoneTillAnnualReview, reminderType);
    }
    return true;
  }
  return false;
}

export async function processPostProviderEmail(
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
  if (isBefore(start, end) && isWithinInterval(intervalDate, { start, end })) {
    let isEmailSent = isEmailSentBefore(audit, postReminderType);
    if (!isEmailSent) {
      await processPostEmailsForList(list, milestoneTillAnnualReview, postReminderType);
    }

    isEmailSent = isEmailSentBefore(listItemAudit as Audit, providerReminderType);
    if (isEmailSent) {
      logger.info(`${providerReminderType} email has already been sent to providers for list ${list.id}`);
      return true;
    }
    const listItemsForAnnualReview = listItems.map((listItem) => {
      listItem.status = "OUT_WITH_PROVIDER";
      listItem.isAnnualReview = true;
      return listItem;
    });
    const updatedListItems = await updateIsAnnualReviewForListItems(listItemsForAnnualReview, list, ListItemEvent.ANNUAL_REVIEW_STARTED, "startAnnualReview");
    await processProviderEmailsForListItems(list, updatedListItems, providerReminderType);
    return true;
  }
  return false;
}
