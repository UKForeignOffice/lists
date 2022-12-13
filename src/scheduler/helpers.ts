import {
  Audit,
  ListAnnualReviewPostReminderType,
  ListEventJsonData,
  ListItemAnnualReviewProviderReminderType,
} from "server/models/types";
import { logger } from "server/services/logger";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";

const defaultTodayDateString = new Date().toLocaleString("default", { year: "numeric", month: "long", day: "numeric" });
export const now = new Date(Date.now());
const todayDateString = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function parseDate(dateString = defaultTodayDateString) {
  const date = new Date(Date.parse(dateString));
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function formatDate(date: Date = todayDateString) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleString('en-gb', options);
}

export function createAnnualReviewProviderUrl(listItem: ListItemWithHistory): string {
  const protocol = isLocalHost ? "http" : "https";
  const host = `${protocol}://${SERVICE_DOMAIN}`;
  const path = `/${listItem.listId}/items/${listItem.id}/annual-review`;

  return `${host}${path}`;
}

export function isEmailSentBefore(
  audit: Audit | undefined,
  reminderType: ListAnnualReviewPostReminderType | ListItemAnnualReviewProviderReminderType
): boolean {
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
  if (audit) {
    if (audit?.jsonData) {
      const listEventJsonData = audit.jsonData as ListEventJsonData;
      if (
        listEventJsonData?.reminderType &&
        subsequentEmailsForReminderType[reminderType].includes(listEventJsonData?.reminderType)
      ) {
        logger.info(`Email has been sent before for ${reminderType} reminder type`);
        return true;
      }
    }
  }
  return false;
}
