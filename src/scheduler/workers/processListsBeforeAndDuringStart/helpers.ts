import type {
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
} from "shared/types";
import { logger } from "scheduler/logger";
import type { Audit, Event, AnnualReviewProviderEmailType } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";

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
  if (!event?.jsonData || !reminderType) {
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
    reminderHasBeenSent = subsequentEmails.includes((event.jsonData as ListEventJsonData)?.reminderType as string);
  } else {
    reminderHasBeenSent = subsequentEmails.includes((event.jsonData as Record<string, string>)?.notes[0]);
  }

  if (reminderHasBeenSent) {
    logger.info(`Email has been sent before for ${reminderType} reminder type`);
    return true;
  }
  return false;
}

export async function shouldSend(
  emailType: AnnualReviewProviderEmailType,
  listItemId: number,
  annualReviewReference: string
): Promise<boolean> {
  if (!annualReviewReference) {
    return false;
  }

  /**
   * This query uses postgres enums. Enums in postgres are ordered so `>` operator can be used.
   */
  const event = await prisma.$queryRaw`select * from "Event"
         where "listItemId" = ${listItemId}
           and "annualReviewEmailType" > ${emailType}::"AnnualReviewProviderEmailType"
           and "jsonData"->>'reference' = '${annualReviewReference}'
           and "type" = 'REMINDER'
         order by "time" limit 1`;

  return !event;
}
