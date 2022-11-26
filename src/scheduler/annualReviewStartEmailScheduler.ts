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
import { AuditEvent, ListItemEvent, Status } from "@prisma/client";
import { addDays, addMonths, startOfDay } from "date-fns";
import { recordListItemEvent } from "server/models/audit";

const today = startOfDay(Date.now());
const ONE_MONTH_AWAY = 28;
const ONE_WEEK_AWAY = 7;
const ONE_DAY_AWAY = 1;

async function sendEmails(lists: List[], context: AnnualReviewStartDateContext): Promise<void> {
  logger.info(`[${lists.length}] lists identified ${context.daysBeforeAnnualReviewStart}, days before annual review starts ${JSON.stringify(lists)}`);

  const listIds = lists.map(list => list.id);
  const listItemsForAllLists: ListItemGetObject[] = await findListItemsForLists(listIds, ["PUBLISHED", "CHECK_ANNUAL_REVIEW"]);

  const postAuditEvents: Record<string, ListItemEvent> = {
    "0day": ListItemEvent.ANNUAL_REVIEW_STARTED,
    "1day": ListItemEvent.ANNUAL_REVIEW_START_ONE_DAY_REMINDER_EMAIL_SENT,
    "7day": ListItemEvent.ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_EMAIL_SENT,
    "28day": ListItemEvent.ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_EMAIL_SENT,
  }
  for (const list of lists) {
    // get list items eligible for annual review
    const listItemsEligibleForAnnualReview = listItemsForAllLists.filter(listItem => listItem.listId === list.id);
    logger.info(`checking list ${list.id} ${context.daysBeforeAnnualReviewStart} ${context.datePart} before annual review date ${list.nextAnnualReviewStartDate} with ${listItemsEligibleForAnnualReview.length} listItems [${listItemsEligibleForAnnualReview.map(listItem => listItem.id)}] and publishers [${list.jsonData.publishers}]`);

    if (listItemsEligibleForAnnualReview?.length > 0 && list.jsonData.publishers) {

      for (let publisherEmail of list.jsonData.publishers) {
        logger.info(`sending email to post contact ${publisherEmail} [in dev, instead using ali@cautionyourblast.com]`);
        // @TODO remove this after testing
        publisherEmail = "ali@cautionyourblast.com";

        await sendAnnualReviewPostEmail(
          context.daysBeforeAnnualReviewStart,
          publisherEmail,
          lowerCase(startCase(list.type)),
          list?.country?.name ?? "",
          list.nextAnnualReviewStartDate.toDateString()
        );

        // @ todo REMOVE THIS break ONCE TESTED
        if (1 === 1) break;
      }
      const event = postAuditEvents[`${context.daysBeforeAnnualReviewStart}${context.datePart}`];
      logger.debug(`post audit event for ${context.daysBeforeAnnualReviewStart}, ${context.datePart} = ${event}`);

      await recordListItemEvent(
        {
          eventName: "startAnnualReview",
          itemId: list.id,
          userId: -1,
          // @ts-ignore
        },
        AuditEvent.ANNUAL_REVIEW
      );
    }

    if (context.daysBeforeAnnualReviewStart === 0) {
      // update list items and email providers to confirm annual review start
      const updatedListItems: ListItemGetObject[] = await   updateAnnualReview(
        listItemsEligibleForAnnualReview,
        Status.CHECK_ANNUAL_REVIEW,
        ListItemEvent.ANNUAL_REVIEW_STARTED,
        AuditEvent.ANNUAL_REVIEW);
      const listItemsNotUpdated = listItemsEligibleForAnnualReview.filter(listItem => {
        return updatedListItems.map(updatedListItem => updatedListItem.id).includes(listItem.id);
      })
      if (listItemsNotUpdated) {
        logger.info(`List items ${listItemsNotUpdated.map(listItem => listItem.id)} could not be updated`);
      }

      for (const updatedListItem of updatedListItems) {

        logger.debug(`initialising form runner session`);
        // @TODO update correct landing page once latest annual review changes are merged in
        const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, updatedListItem, "update your annual review", false);

        logger.debug(`sending provider email`);
        await sendAnnualReviewProviderEmail(context.daysBeforeAnnualReviewStart,
          (updatedListItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
          lowerCase(startCase(updatedListItem.type)),
          list?.country?.name ?? "",
          (updatedListItem.jsonData as BaseDeserialisedWebhookData).contactName,
          context.annualReviewStartDate.toDateString(),
          formRunnerEditUserUrl
        );

        // await recordEvent(
        //   {
        //     eventName: "startAnnualReview",
        //     itemId: listItem.id,
        //     userId: -1,
        //   },
        //   listItem.id,
        //   providerAuditEvents[daysBeforeAnnualReviewStart],
        // );

        if (context.daysBeforeAnnualReviewStart === 0) {
          // @todo REMOVE THIS break ONCE TESTED
          break;
        }
      }
    }
  }
}

export async function sendAnnualReviewStartEmails(): Promise<void> {
  const unpublishedDateContextsForFiltering: AnnualReviewStartDateContext[] = [
    {
      annualReviewStartDate: addDays(today, ONE_MONTH_AWAY),
      daysBeforeAnnualReviewStart: ONE_MONTH_AWAY,
      datePart: "day",
    },
    {
      annualReviewStartDate: addDays(today, ONE_WEEK_AWAY),
      daysBeforeAnnualReviewStart: ONE_WEEK_AWAY,
      datePart: "day"
    },
    {
      annualReviewStartDate: addDays(today, ONE_DAY_AWAY),
      daysBeforeAnnualReviewStart: ONE_DAY_AWAY,
      datePart: "day"
    },
    {
      annualReviewStartDate: today,
      daysBeforeAnnualReviewStart: 0,
      datePart: "day"
    }];

  const lists: List[] | undefined = await findListByAnnualReviewDate(unpublishedDateContextsForFiltering.map(context => context.annualReviewStartDate));
  logger.info(`******FOUND ${lists?.length} LISTS matching annual review start dates [${unpublishedDateContextsForFiltering.map(context => context.annualReviewStartDate)}]`);

  if (lists) {
    for (const context of unpublishedDateContextsForFiltering) {
      await sendEmails(lists.filter(list => list.nextAnnualReviewStartDate.toDateString() === context.annualReviewStartDate.toDateString()), context);
    }
  }
}

interface AnnualReviewStartDateContext {
  annualReviewStartDate: Date;
  daysBeforeAnnualReviewStart: number;
  datePart: string;
}

sendAnnualReviewStartEmails().then(r => {
  logger.info(`Reason after scheduler: ${r}`);
  process.exit(0);

}).catch(r => {
  logger.error(`Error reason after scheduler: ${r}`);
  process.exit(1);
});
