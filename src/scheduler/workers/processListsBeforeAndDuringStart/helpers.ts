import type { ListAnnualReviewPostReminderType } from "shared/types";
import { logger } from "scheduler/logger";
import type { Audit, Event, AnnualReviewProviderEmailType } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";
import type { RemindersBeforeStartDate } from "scheduler/batch/helpers";

export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString("en-gb", options);
}

// TODO: use a query like in `shouldSend`. This function relies on the entire event or audit to be loaded into the fn, then uses iterations to determine if an email has been sent or superseded.
export function isEmailSentBefore(event: Audit | undefined, reminderType: RemindersBeforeStartDate): boolean {
  if (!event?.jsonData || !reminderType || !event) {
    return false;
  }

  const subsequentEmailsForReminderType: Record<RemindersBeforeStartDate, ListAnnualReviewPostReminderType[]> = {
    oneMonthBeforeStart: ["oneMonthBeforeStart", "oneWeekBeforeStart", "oneDayBeforeStart", "started"],
    oneWeekBeforeStart: ["oneWeekBeforeStart", "oneDayBeforeStart", "started"],
    oneDayBeforeStart: ["oneDayBeforeStart", "started"],
    started: ["started"],
  };

  const subsequentEmails: string[] = subsequentEmailsForReminderType[reminderType];
  const reminderHasBeenSent = subsequentEmails.includes(
    event.annualReviewEmailType ?? (event.jsonData as Record<string, string>)?.reminderType
  );

  if (reminderHasBeenSent) {
    logger.info(`Email has been sent before for ${reminderType} reminder type`);
    return true;
  }
  return false;
}

/**
 * Determines whether `emailType` should be sent for `annualReviewReference`.
 * All annual review audits or events are recorded with the {@link annualReviewReference} or `reference` from `{@link List.jsonData.currentAnnualReview.reference}`.
 */
export async function shouldSend(
  emailType: AnnualReviewProviderEmailType,
  listItemId: number,
  annualReviewReference?: string
): Promise<boolean> {
  if (!annualReviewReference) {
    logger.warn(
      `shouldSend: Annual review reference was not supplied, could not look up whether ${emailType} should be sent to ${listItemId}.`
    );
    return false;
  }
  /**
   * This query uses postgres enums. Enums in postgres are ordered so `>` operator can be used.
   */
  const event: Event[] | undefined = await prisma.$queryRaw`select * from "Event"
         where "listItemId" = ${listItemId}
           and "annualReviewEmailType" > ${emailType}::"AnnualReviewProviderEmailType"
           and "jsonData"->>'reference' = '${annualReviewReference}'
           and "type" = 'REMINDER'
         order by "time" limit 1`;

  /**
   * Query always returns array, hence [0].
   */
  const hasItems = (event ?? []).length >= 1;

  if (hasItems) {
    logger.info(`shouldSend: ${emailType} Email has already been sent to ${listItemId} on ${event?.[0].time}`);
    return false;
  }

  logger.debug(`shouldSend: ${emailType} Email has not been sent to ${listItemId}`);
  return true;
}
