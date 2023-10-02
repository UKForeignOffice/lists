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
 * if `emailType` is `oneMonthBeforeStart` and an email has been sent for `oneWeekBeforeStart` or `oneDayBeforeStart` or `started`, this function will return false.
 * @param emailType the `{@link ListAnnualReviewPostReminderType}` to check. If an email has been sent for this type OR a type larger than this type, this function will return false.
 * @param reference annual review reference
 */
export async function shouldSendToPost(emailType: ListAnnualReviewPostReminderType, reference: string) {
  /**
   * This query uses postgres enums. Enums in postgres are ordered so `>=` operator can be used.
   * Looks for events with `listItemId` and where an annualReviewEmailType > than `emailType` has occurred.
   */
  const result: Audit[] = await prisma.$queryRaw`select * from "Audit"
           where "annualReviewEmailType" >= ${emailType}::"AnnualReviewPostEmailType"
           and "jsonData"->>'annualReviewRef' = ${reference}
         order by "createdAt" limit 1`;

  logger.info(`${reference} - found ${result?.length} reminders >= ${emailType}`);

  const auditSupersedingSelectedType = result?.at?.(0);

  if (auditSupersedingSelectedType) {
    // @ts-ignore
    const listId = auditSupersedingSelectedType.jsonData?.itemId;
    logger.info(
      `shouldSend: ${emailType} Email has already been sent to ${listId} on ${auditSupersedingSelectedType.createdAt}`
    );
    return false;
  }

  logger.debug(`shouldSend: ${emailType} Email has not been sent for ${reference}`);
  return true;
}

/**
 * if `emailType` is `oneMonthBeforeStart` and an email has been sent for `oneWeekBeforeStart` or `oneDayBeforeStart` or `started`, this function will return false.
 * @param emailType the `{@link AnnualReviewProviderEmailType}` to check. If an email has been sent for this type OR a type larger than this type, this function will return false.
 * @param listItemId the list item id to check
 * @param annualReviewReference
 */
export async function shouldSendToProvider(
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
   * This query uses postgres enums. Enums in postgres are ordered so `>=` operator can be used.
   * Looks for events with `listItemId` and where an annualReviewEmailType >= than `emailType` has occurred.
   */
  const result: Event[] = await prisma.$queryRaw`select * from "Event"
         where "listItemId" = ${listItemId}
           and "annualReviewEmailType" >= ${emailType}::"AnnualReviewProviderEmailType"
           and "jsonData"->>'reference' = '${annualReviewReference}'
           and "type" = 'REMINDER'
         order by "time" desc limit 1`;

  const eventSupersedingSelectedType = result?.at?.(0);

  if (eventSupersedingSelectedType) {
    logger.info(
      `shouldSend: ${emailType} Email has already been sent to ${listItemId} on ${eventSupersedingSelectedType.time}`
    );
    return false;
  }

  logger.debug(`shouldSend: ${emailType} Email has not been sent to ${listItemId}`);
  return true;
}
