import { AnnualReviewKeyDates, Audit, List } from "server/models/types";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { createAnnualReviewProviderUrl, formatDate, processPostEmail, processPostProviderEmail } from "./helpers";
import { sendAnnualReviewProviderEmail } from "server/services/govuk-notify";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { lowerCase, startCase } from "lodash";
import { endOfDay, subDays } from "date-fns";

export async function emailProviderForAnnualReviewKeyDates(list: List, listItem: ListItemWithHistory) {
  const annualReviewProviderUrl = createAnnualReviewProviderUrl(listItem);
  const unpublishDate = new Date(list.jsonData.currentAnnualReview?.keyDates.unpublished.UNPUBLISH ?? "");
  return await sendAnnualReviewProviderEmail(
    (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
    lowerCase(startCase(listItem.type)),
    list?.country?.name ?? "",
    (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
    formatDate(unpublishDate),
    annualReviewProviderUrl
  );
}

export async function processAnnualReviewEmails(
  list: List,
  listItemsForList: ListItemWithHistory[],
  audit: Audit,
  today: Date,
  annualReviewKeyDates: AnnualReviewKeyDates
): Promise<boolean> {
  if (
    await processPostEmail(
      list,
      audit,
      "POST_ONE_MONTH",
      today,
      new Date(annualReviewKeyDates?.POST_ONE_MONTH ?? ""),
      subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? "")), 1),
      "sendOneMonthPostEmail"
    )
  ) {
    return true;
  }

  if (
    await processPostEmail(
      list,
      audit,
      "POST_ONE_WEEK",
      today,
      new Date(annualReviewKeyDates?.POST_ONE_WEEK ?? ""),
      subDays(endOfDay(new Date(annualReviewKeyDates?.POST_ONE_DAY ?? "")), 1),
      "sendOneWeekPostEmail"
    )
  ) {
    return true;
  }

  if (
    await processPostEmail(
      list,
      audit,
      "POST_ONE_DAY",
      today,
      new Date(annualReviewKeyDates?.POST_ONE_DAY ?? ""),
      endOfDay(new Date(annualReviewKeyDates?.POST_ONE_DAY ?? "")),
      "sendOneDayPostEmail"
    )
  ) {
    return true;
  }

  if (
    await processPostProviderEmail(
      list,
      listItemsForList,
      audit,
      "START",
      today,
      new Date(annualReviewKeyDates?.START ?? ""),
      endOfDay(new Date(annualReviewKeyDates?.START ?? "")),
      "sendStartedPostEmail",
      "sendStartedProviderEmail"
    )
  ) {
    return true;
  }
  return false;
}
