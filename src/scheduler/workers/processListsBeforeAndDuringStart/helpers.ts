import type {
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
} from "shared/types";
import { logger } from "scheduler/logger";
import type { Audit, Event } from "@prisma/client";

export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString("en-gb", options);
}

export function isEmailSentBefore(
  event: Event | Audit | undefined,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType
): boolean {
  if (!event?.jsonData) {
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
  const subsequentEmails: string[] = subsequentEmailsForReminderType[reminderType];
  let reminderHasBeenSent = false;
  if ("createdAt" in event) {
    reminderHasBeenSent = subsequentEmails?.includes?.((event.jsonData as ListEventJsonData)?.reminderType as string);
  } else {
    reminderHasBeenSent = subsequentEmails?.includes?.((event.jsonData as Record<string, string>)?.notes);
  }

  if (reminderHasBeenSent) {
    logger.info(`Email has been sent before for ${reminderType} reminder type`);
    return true;
  }
  return false;
}
