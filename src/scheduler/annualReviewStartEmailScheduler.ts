import { findListByAnnualReviewDate } from "server/models/list";
import {
  List, ListItemGetObject,
} from "server/models/types";
import { logger } from "server/services/logger";
import { findListItemsForLists, updateAnnualReview } from "server/models/listItem";
import {
  sendAnnualReviewPostEmail, sendAnnualReviewProviderEmail,
} from "server/services/govuk-notify";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { lowerCase, startCase } from "lodash";
import { AuditEvent, ListItem, ListItemEvent, Status } from "@prisma/client";
import { addDays } from "date-fns";
import { recordListItemEvent } from "server/models/audit";
import { SCHEDULED_PROCESS_TODAY_DATE } from "server/config";
import { getTodayDate } from "./helpers";
import { EventMetaData } from "server/utils/validation";

const ONE_MONTH_AWAY = 28;
const ONE_WEEK_AWAY = 7;
const ONE_DAY_AWAY = 1;

async function addAuditEventForEmail(context: AnnualReviewStartDateContext, list: List) {
  const postEvents: Record<number, EventMetaData> = {
    0: {
      auditEvent: AuditEvent.ANNUAL_REVIEW_STARTED_POST_EMAIL_SENT,
      auditListItemEventName: "sendAnnualReviewStartedPostEmail",
    },
    1: {
      auditEvent: AuditEvent.ANNUAL_REVIEW_START_ONE_DAY_REMINDER_POST_EMAIL_SENT,
      auditListItemEventName: "sendAnnualReviewOneDayReminderPostEmail",
    },
    7: {
      auditEvent: AuditEvent.ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_POST_EMAIL_SENT,
      auditListItemEventName: "sendAnnualReviewOneWeekReminderPostEmail",
    },
    28: {
      auditEvent: AuditEvent.ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_POST_EMAIL_SENT,
      auditListItemEventName: "sendAnnualReviewOneMonthReminderPostEmail",
    },
  };

  await recordListItemEvent(
    {
      eventName: postEvents[context.daysBeforeAnnualReviewStart].auditListItemEventName,
      itemId: list.id,
    },
    postEvents[context.daysBeforeAnnualReviewStart].auditEvent as AuditEvent,
    "list"
  );
}

async function emailPosts(
  listItemsEligibleForAnnualReview: ListItem[],
  list: List,
  context: AnnualReviewStartDateContext,
) {

  if (listItemsEligibleForAnnualReview?.length > 0 && list.jsonData.publishers) {
    for (const publisherEmail of list.jsonData.publishers) {
      const annualReviewPostEmailResult = await sendAnnualReviewPostEmail(
        context.daysBeforeAnnualReviewStart,
        publisherEmail,
        lowerCase(startCase(list.type)),
        list?.country?.name ?? "",
        list.nextAnnualReviewStartDate.toDateString()
      );

      if (annualReviewPostEmailResult.error) {
        logger.error(`Unable to send annual review email to post contact ${publisherEmail}`);
      }
    }
    await addAuditEventForEmail(context, list);
  }
}

async function emailProviders(updatedListItems: ListItem[], list: List, context: AnnualReviewStartDateContext) {
  for (const updatedListItem of updatedListItems) {
    // @TODO update correct landing page once latest annual review changes are merged in
    const formRunnerEditUserUrl = await initialiseFormRunnerSession(
      list,
      updatedListItem as ListItemGetObject,
      "update your annual review",
      false
    );

    const providerEmailResult = await sendAnnualReviewProviderEmail(
      context.daysBeforeAnnualReviewStart,
      (updatedListItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
      lowerCase(startCase(updatedListItem.type)),
      list?.country?.name ?? "",
      (updatedListItem.jsonData as BaseDeserialisedWebhookData).contactName,
      context.annualReviewStartDate.toDateString(),
      formRunnerEditUserUrl
    );

    if (providerEmailResult.result) {
      await recordListItemEvent(
        {
          eventName: "sendAnnualReviewStartedProviderEmail",
          itemId: list.id,
        },
        AuditEvent.ANNUAL_REVIEW_STARTED_PROVIDER_EMAIL_SENT,
        "listItem"
      );
    }
  }
}

async function sendEmails(lists: List[], context: AnnualReviewStartDateContext): Promise<void> {
  logger.info(`[${lists.length}] lists identified ${context.daysBeforeAnnualReviewStart}, days before annual review starts ${JSON.stringify(lists)}`);

  const listIds = lists.map(list => list.id);
  const findListItemsResult = await findListItemsForLists(listIds, ["PUBLISHED", "CHECK_ANNUAL_REVIEW"], false);
  if (findListItemsResult.error) {
    logger.error(`Unable to send emails.  Unable to retrieve List Items for Lists ${listIds}`);

  } else if (findListItemsResult.result) {
    const listItemsForAllLists = findListItemsResult.result;
    for (const list of lists) {
      // get list items eligible for annual review
      const listItemsEligibleForAnnualReview = listItemsForAllLists.filter(listItem => listItem.listId === list.id);
      logger.info(`checking list ${list.id} ${context.daysBeforeAnnualReviewStart} ${context.datePart}
      before annual review date ${list.nextAnnualReviewStartDate} with ${listItemsEligibleForAnnualReview.length}
      listItems [${listItemsEligibleForAnnualReview.map(listItem => listItem.id)}]
      and publishers [${list.jsonData.publishers}]`);

      if (listItemsForAllLists.length > 0) {
        await emailPosts(listItemsEligibleForAnnualReview, list, context);

        if (context.daysBeforeAnnualReviewStart === 0) {
          // update list items and email providers to confirm annual review start
          const updatedListItems: ListItem[] = await updateAnnualReview(
            listItemsEligibleForAnnualReview,
            Status.CHECK_ANNUAL_REVIEW,
            ListItemEvent.ANNUAL_REVIEW_STARTED,
            "startAnnualReview",
            AuditEvent.ANNUAL_REVIEW);
          const listItemsNotUpdated = listItemsEligibleForAnnualReview.filter(listItem => {
            return updatedListItems.map(updatedListItem => updatedListItem.id).includes(listItem.id);
          })
          if (listItemsNotUpdated) {
            logger.info(`List items ${listItemsNotUpdated.map(listItem => listItem.id)} could not be updated`);
          }

          await emailProviders(updatedListItems, list, context);
        }
      }
    }
  }
}

interface AnnualReviewStartDateContext {
  annualReviewStartDate: Date;
  daysBeforeAnnualReviewStart: number;
  datePart: string;
}

function getAnnualReviewStartDateContexts(todayDateString: string): AnnualReviewStartDateContext[] {
  const today = getTodayDate(todayDateString);

  const annualReviewStartDateContexts: AnnualReviewStartDateContext[] = [
    {
      annualReviewStartDate: addDays(today, ONE_MONTH_AWAY),
      daysBeforeAnnualReviewStart: ONE_MONTH_AWAY,
      datePart: "day",
    },
    {
      annualReviewStartDate: addDays(today, ONE_WEEK_AWAY),
      daysBeforeAnnualReviewStart: ONE_WEEK_AWAY,
      datePart: "day",
    },
    {
      annualReviewStartDate: addDays(today, ONE_DAY_AWAY),
      daysBeforeAnnualReviewStart: ONE_DAY_AWAY,
      datePart: "day",
    },
    {
      annualReviewStartDate: today,
      daysBeforeAnnualReviewStart: 0,
      datePart: "day",
    },
  ];
  return annualReviewStartDateContexts;
}

export async function sendAnnualReviewStartEmails(todayDateString: string): Promise<void> {
  const annualReviewStartDateContexts = getAnnualReviewStartDateContexts(todayDateString);

  const annualReviewStartDates = annualReviewStartDateContexts.map((context) => context.annualReviewStartDate);
  const lists: List[] | undefined = await findListByAnnualReviewDate(annualReviewStartDates);
  logger.info(`******FOUND ${lists?.length} LISTS matching annual review start dates [${annualReviewStartDates}]`);

  if (lists) {
    for (const context of annualReviewStartDateContexts) {
      await sendEmails(lists.filter(list => list.nextAnnualReviewStartDate.toDateString() === context.annualReviewStartDate.toDateString()), context);
    }
  }
}

const todayDateString = SCHEDULED_PROCESS_TODAY_DATE;

sendAnnualReviewStartEmails(todayDateString).then(r => {
  logger.info(`Reason after scheduler: ${r}`);
  process.exit(0);

}).catch(r => {
  logger.error(`Error reason after scheduler: ${r}`);
  process.exit(1);
});
