import { findListByAnnualReviewDate } from "server/models/list";
import {
  List, ListItemGetObject,
} from "server/models/types";
import { logger } from "server/services/logger";
import { findListItemsForLists, updateUnpublished } from "server/models/listItem";
import {
  sendAnnualReviewProviderEmail,
  sendUnpublishedPostEmail, sendUnpublishedProviderEmail
} from "server/services/govuk-notify";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { lowerCase, startCase } from "lodash";
import { AuditEvent, ListItemEvent, Status } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { recordListItemEvent } from "server/models/audit";

const todayLocal = new Date();
const today = new Date(Date.UTC(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate()));

const SIX_WEEKS_AHEAD = 42;
const SIX_WEEKS_AGO = 42;
const ONE_WEEK_AGO = 7;
const FIVE_WEEKS_AGO = 35;
const ONE_DAY_AGO = 1;

async function sendEmailBeforeUnpublished(lists: List[], unpublishedDateContext: UnpublishedDateContext): Promise<void> {
  const daysBeforeUnpublishing = unpublishedDateContext.daysBeforeUnpublished;
  logger.info(`[${lists.length}] lists identified
   [${daysBeforeUnpublishing}] days before unpublishing
   unpublish date ${unpublishedDateContext.unpublishDate.toUTCString()}
   annual review start date ${unpublishedDateContext.annualReviewStartDate}
   data [${JSON.stringify(lists)}]`);

  const listItemsForAllLists: ListItemGetObject[] = await findListItemsForLists(lists.map(list => list.id), [Status.CHECK_ANNUAL_REVIEW]);

  for (const list of lists) {

    // get list items eligible for annual review
    const listItemsEligibleForAnnualReview = listItemsForAllLists.filter(listItem => listItem.listId === list.id);

    // email post only if there are list items eligible for annual review 1 week
    // before, 1 day before and when unpublished
    if ([0,1,7].includes(unpublishedDateContext.daysBeforeUnpublished) &&
      listItemsEligibleForAnnualReview &&
      list.jsonData.publishers) {

      for (let publisherEmail of list.jsonData.publishers) {
        logger.info(`in dev, instead using ali@cautionyourblast.com]`);
        // @TODO remove this after testing
        publisherEmail = "ali@cautionyourblast.com";

        try {
          await sendUnpublishedPostEmail(
            daysBeforeUnpublishing,
            publisherEmail,
            lowerCase(startCase(list.type)),
            list?.country?.name ?? "",
            listItemsEligibleForAnnualReview.length.toString()
          );

        } catch (e) {
          logger.error(`unable to send post email ${daysBeforeUnpublishing} days before unpublishing: ${(e).stack}`);
        }

        // @ todo REMOVE THIS break ONCE TESTED
        if (1 === 1) break;
      }
      await recordListItemEvent(
        {
          eventName: "sendAnnualReviewUnpublishWeeklyReminderEmail",
          itemId: list.id,
          userId: -1,
          // @ts-ignore
        },
        AuditEvent.UNPUBLISHED
      );

      // await recordEvent(
      //   {
      //     eventName: "sendPostUnpublishReminderEmail",
      //     itemId: list.id,
      //     userId: -1,
      //   },
      //   list.id,
      //   postAuditEvents[daysBeforeUnpublishing],
      // );
    }
    // update list items and email providers to confirm annual review start
    for (const listItem of listItemsEligibleForAnnualReview) {
      let updatedListItem;

      if (daysBeforeUnpublishing === 0) {
        updatedListItem = await updateUnpublished(
          listItem,
          Status.UNPUBLISHED,
          ListItemEvent.UNPUBLISHED,
          AuditEvent.UNPUBLISHED);

        if (!updatedListItem) {
          logger.info(`List items ${listItem.id} could not be updated`);
        }
      }
      if (daysBeforeUnpublishing !== 0 || (daysBeforeUnpublishing === 0 && updatedListItem)) {

        logger.debug(`initialising form runner session`);
        // @TODO update correct landing page once latest annual review changes are merged in
        const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem, "update your annual review", false);

        logger.debug(`sending provider email`);
        try {
          if ([0,1].includes(daysBeforeUnpublishing)) {
            await sendUnpublishedProviderEmail(daysBeforeUnpublishing,
              (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
              lowerCase(startCase(listItem.type)),
              list?.country?.name ?? "",
              (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
              unpublishedDateContext.unpublishDate.toDateString(),
              formRunnerEditUserUrl
            );

          } else {
            await sendAnnualReviewProviderEmail(0,
              (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
              lowerCase(startCase(listItem.type)),
              list?.country?.name ?? "",
              (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
              unpublishedDateContext.unpublishDate.toDateString(),
              formRunnerEditUserUrl
            );
          }

          await recordListItemEvent(
            {
              eventName: "sendAnnualReviewUnpublishWeeklyReminderEmail",
              itemId: listItem.id,
              userId: -1,
              // @ts-ignore
            },
            AuditEvent.UNPUBLISHED
          );

          // await recordEvent(
          //   {
          //     eventName: "sendProviderUnpublishReminderEmail",
          //     itemId: updatedListItem.id,
          //     userId: -1
          //   },
          //   listItem.id,
          //   providerAuditEvents[daysBeforeUnpublishing]
          // );
        } catch (e) {
          logger.error(`could not send provider email ${daysBeforeUnpublishing} days before unpublishing: \n\n${(e as Error).stack}`);
        }

        // @todo REMOVE THIS break ONCE TESTED
        break;
      }
    }
  }
}

export async function sendUnpublishedEmails(): Promise<void> {
  const unpublishedDateSixWeeksAway = addDays(today, SIX_WEEKS_AGO);
  const unpublishedDateOneDayAway = subDays(unpublishedDateSixWeeksAway, 41);

  const unpublishedDateContextsForFiltering: UnpublishedDateContext[] = [
    {
      annualReviewStartDate: subDays(unpublishedDateOneDayAway, SIX_WEEKS_AGO),
      daysBeforeUnpublished: ONE_DAY_AGO,
      unpublishDate: unpublishedDateOneDayAway,
    },
    {
      annualReviewStartDate: subDays(today, SIX_WEEKS_AGO),
      daysBeforeUnpublished: 0,
      unpublishDate: today,
    }];

  for  (let daysBeforeUnpublished = ONE_WEEK_AGO; daysBeforeUnpublished <= FIVE_WEEKS_AGO; daysBeforeUnpublished += 7) {
    const localUnpublishDate = addDays(today, daysBeforeUnpublished);
    const unpublishDate = new Date(Date.UTC(localUnpublishDate.getFullYear(), localUnpublishDate.getMonth(), localUnpublishDate.getDate(), 0,0,0));

    const localAnnualReviewStartDate = subDays(unpublishDate, SIX_WEEKS_AHEAD);
    const annualReviewStartDate = new Date(Date.UTC(localAnnualReviewStartDate.getFullYear(), localAnnualReviewStartDate.getMonth(), localAnnualReviewStartDate.getDate(), 0,0,0));

    unpublishedDateContextsForFiltering.push({
      annualReviewStartDate,
      daysBeforeUnpublished,
      unpublishDate
    });
  }

  const annualReviewStartDates = unpublishedDateContextsForFiltering.map(context => context.annualReviewStartDate);
  const lists: List[] | undefined = await findListByAnnualReviewDate(annualReviewStartDates);
  logger.info(`******FOUND ${lists?.length} LISTS with annual review dates [${lists?.map(list => list.nextAnnualReviewStartDate.toUTCString())}]  , matching annual review start dates [${annualReviewStartDates.map(date => date.toUTCString())}]`);

  if (lists) {
    for (const context of unpublishedDateContextsForFiltering) {
      await sendEmailBeforeUnpublished(lists.filter(list => list.nextAnnualReviewStartDate.toDateString() === context.annualReviewStartDate.toDateString()), context);
    }
  }
}

interface UnpublishedDateContext {
  annualReviewStartDate: Date;
  daysBeforeUnpublished: number;
  unpublishDate: Date;
}

sendUnpublishedEmails().then(r => {
  logger.info(`Reason after scheduler: ${r}`);
  process.exit(0);

}).catch(r => logger.error(`Error reason after scheduler: ${r}`));
