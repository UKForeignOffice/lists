import {
  Audit,
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
} from "server/models/types";
import { logger } from "server/services/logger";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";

export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString('en-gb', options);
}

export function createAnnualReviewProviderUrl(listItem: ListItemWithHistory): string {
  const protocol = isLocalHost ? "http" : "https";
  const host = `${protocol}://${SERVICE_DOMAIN}`;
  const path = `/annual-review/confirm/${listItem.reference}`;

  return `${host}${path}`;
}

export function isEmailSentBefore(
  audit: Audit | undefined,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType
): boolean {
  if (!audit || !audit.jsonData) {
    return false;
  }
  const subsequentEmailsForReminderType = {
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
  };
  const listEventJsonData = audit.jsonData as ListEventJsonData;
  const subsequentEmails: string[] = subsequentEmailsForReminderType[reminderType];
  const reminderHasBeenSent = subsequentEmails?.includes?.(listEventJsonData?.reminderType as string) ?? false;
  if (reminderHasBeenSent) {
    logger.info(`Email has been sent before for ${reminderType} reminder type`);
    return true;
  }
  return false;
}
