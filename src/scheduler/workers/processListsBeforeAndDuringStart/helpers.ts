import type {
  Audit,
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
} from "shared/types";
import { logger } from "scheduler/logger";

export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString("en-gb", options);
}

export function isEmailSentBefore(
  audit: Audit | undefined,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType
): boolean {
  if (!audit?.jsonData) {
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
