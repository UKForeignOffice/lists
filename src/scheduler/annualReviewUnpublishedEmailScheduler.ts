// import { findListByAnnualReviewDate } from "server/models/list";
// import { List, ListItem, ListItemGetObject } from "server/models/types";
// import { logger } from "server/services/logger";
// import { findListItemsForLists, updateUnpublished } from "server/models/listItem";
// import {
//   sendAnnualReviewProviderEmail,
//   sendUnpublishedPostEmail,
//   sendUnpublishedProviderEmail,
// } from "server/services/govuk-notify";
// import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
// import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
// import { lowerCase, startCase } from "lodash";
// import { AuditEvent, ListItemEvent, Prisma, Status } from "@prisma/client";
// import { addDays, subDays } from "date-fns";
// import { recordListItemEvent } from "server/models/audit";
// import { SCHEDULED_PROCESS_TODAY_DATE } from "server/config";
// import { getTodayDate } from "./helpers";
// import { EventMetaData } from "server/utils/validation";
//
// const SIX_WEEKS = 42;
// const ONE_WEEK = 7;
// const FIVE_WEEKS = 35;
// const ONE_DAY = 1;
// const TODAY = 0;
//
// type Milestones = TODAY | ONE_DAY | ONE_WEEK | FIVE_WEEKS | SIX_WEEKS;
//
// interface UnpublishedDateContext {
//   annualReviewStartDate: Date;
//   daysBeforeUnpublished: Milestones;
//   unpublishDate: Date;
// }
//
// async function addAuditEventForPostEmail(context: UnpublishedDateContext, list: List) {
//   const postEvents: Record<Milestones, Prisma.AuditCreateInput> = {
//     0: recordListItemEvent({
//         eventName: "sendUnpublishedPostEmail",
//         itemId: list.id
//       },
//       AuditEvent.UNPUBLISHED_POST_EMAIL_SENT,
//       "list"
//     ),
//     1: recordListItemEvent({
//         eventName: "sendOneDayUnpublishedReminderPostEmail",
//         itemId: list.id
//       },
//       AuditEvent.UNPUBLISH_ONE_DAY_REMINDER_POST_EMAIL_SENT,
//       "list"
//     ),
//     7: recordListItemEvent({
//         eventName: "sendWeeklyUnpublishedReminderPostEmail",
//         itemId: list.id
//       },
//       AuditEvent.UNPUBLISH_WEEKLY_REMINDER_POST_EMAIL_SENT,
//       "list"
//     ),
//   };
//   postEvents[context.daysBeforeUnpublished]();
// }
//
// async function sendPostEmails(
//   context: UnpublishedDateContext,
//   list: List,
//   listItemsEligibleForAnnualReview: ListItem[]
// ) {
//   // email post only if there are list items eligible for annual review 7, 1, 0 days before being unpublished
//   if (
//     [TODAY, ONE_DAY, ONE_WEEK].includes(context.daysBeforeUnpublished) &&
//     listItemsEligibleForAnnualReview &&
//     list.jsonData.publishers
//   ) {
//     let allEmailsFailed = true;
//     for (const publisherEmail of list.jsonData.publishers) {
//       const { result } = await sendUnpublishedPostEmail(
//         context.daysBeforeUnpublished,
//         publisherEmail,
//         lowerCase(startCase(list.type)),
//         list?.country?.name ?? "",
//         listItemsEligibleForAnnualReview.length.toString()
//       );
//       if (result && allEmailsFailed) allEmailsFailed = false;
//     }
//     if (!allEmailsFailed) {
//       await addAuditEventForPostEmail(context, list);
//     }
//   }
// }
//
// async function addAuditEventForProviderEmail(context: UnpublishedDateContext, listItem: ListItem) {
//   const providerEvents: Record<number, EventMetaData> = {
//     0: {
//       auditEvent: AuditEvent.UNPUBLISHED_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendUnpublishedProviderEmail",
//     },
//     1: {
//       auditEvent: AuditEvent.UNPUBLISH_ONE_DAY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendOneDayUnpublishedReminderProviderEmail",
//     },
//     7: {
//       auditEvent: AuditEvent.UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendWeeklyUnpublishedReminderProviderEmail",
//     },
//     14: {
//       auditEvent: AuditEvent.UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendWeeklyUnpublishedReminderProviderEmail",
//     },
//     21: {
//       auditEvent: AuditEvent.UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendWeeklyUnpublishedReminderProviderEmail",
//     },
//     28: {
//       auditEvent: AuditEvent.UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendWeeklyUnpublishedReminderProviderEmail",
//     },
//     35: {
//       auditEvent: AuditEvent.UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT,
//       auditListItemEventName: "sendWeeklyUnpublishedReminderProviderEmail",
//     },
//   };
//
//   await recordListItemEvent(
//     {
//       eventName: providerEvents[context.daysBeforeUnpublished].auditListItemEventName,
//       itemId: listItem.id,
//     },
//     providerEvents[context.daysBeforeUnpublished].auditEvent as AuditEvent,
//     "listItem"
//   );
// }
//
// async function sendProviderEmails(
//   context: UnpublishedDateContext,
//   list: List,
//   listItem: ListItem,
// ) {
//   // @TODO update correct landing page once latest annual review changes are merged in
//   const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem as ListItemGetObject, "update your annual review", false);
//
//   let result;
//   if ([TODAY, ONE_DAY].includes(context.daysBeforeUnpublished)) {
//     result = await sendUnpublishedProviderEmail(
//       context.daysBeforeUnpublished,
//       (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
//       lowerCase(startCase(listItem.type)),
//       list?.country?.name ?? "",
//       (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
//       context.unpublishDate.toDateString(),
//       formRunnerEditUserUrl
//     );
//   } else {
//     result = await sendAnnualReviewProviderEmail(
//       0,
//       (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
//       lowerCase(startCase(listItem.type)),
//       list?.country?.name ?? "",
//       (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
//       context.unpublishDate.toDateString(),
//       formRunnerEditUserUrl
//     );
//   }
//
//   if (result.result) {
//     await addAuditEventForProviderEmail(context, listItem);
//   }
// }
//
// async function sendEmails(lists: List[], unpublishedDateContext: UnpublishedDateContext): Promise<void> {
//   const daysBeforeUnpublishing = unpublishedDateContext.daysBeforeUnpublished;
//   logger.info(`[${lists.length}] lists identified
//    [${daysBeforeUnpublishing}] days before unpublishing
//    unpublish date ${unpublishedDateContext.unpublishDate.toUTCString()}
//    annual review start date ${unpublishedDateContext.annualReviewStartDate}`);
//
//   const listIds = lists.map(list => list.id);
//   const findListItemsResult = await findListItemsForLists(listIds, [Status.CHECK_ANNUAL_REVIEW], true);
//
//   if (findListItemsResult.error) {
//     logger.error(`Could not send unpublished emails - ListItems could not be retrieved`);
//
//   } else if (findListItemsResult.result) {
//     const listItemsForAllLists = findListItemsResult.result;
//     for (const list of lists) {
//       const listItemsEligibleForAnnualReview = listItemsForAllLists.filter((listItem) => listItem.listId === list.id);
//
//       // only send emails if there are list items still in CHECK_ANNUAL_REVIEW status
//       if (listIds.length > 0) {
//         await sendPostEmails(unpublishedDateContext, list, listItemsEligibleForAnnualReview);
//
//         // update list items and email providers to confirm annual review start
//         for (const listItem of listItemsEligibleForAnnualReview) {
//           let updatedListItem;
//
//           if (daysBeforeUnpublishing === TODAY) {
//             updatedListItem = await updateUnpublished(
//               listItem,
//               Status.UNPUBLISHED,
//               ListItemEvent.UNPUBLISHED,
//               AuditEvent.UNPUBLISHED
//             );
//
//             if (!updatedListItem) {
//               logger.info(`List items ${listItem.id} could not be updated`);
//             }
//           }
//           if (daysBeforeUnpublishing !== 0 || (daysBeforeUnpublishing === 0 && updatedListItem)) {
//             await sendProviderEmails(unpublishedDateContext, list, listItem);
//           }
//         }
//       }
//     }
//   }
// }
//
// /**
//  * Calculate the annual review dates six weeks prior to the unpublish date of 0, 1, 7, 14, 21, 28, 35 days in the future
//  * from the todayDateString.
//  * @param todayDateString
//  * @returns UnpublishedDateContext[]
//  */
// function getUnpublishedDateContexts(todayDateString: string): UnpublishedDateContext[] {
//   const today = getTodayDate(todayDateString);
//   const unpublishedDateSixWeeksAway = addDays(today, SIX_WEEKS);
//   const unpublishedDateOneDayAway = subDays(unpublishedDateSixWeeksAway, 41);
//
//   const unpublishedDateContextsForFiltering: UnpublishedDateContext[] = [
//     {
//       annualReviewStartDate: subDays(unpublishedDateOneDayAway, SIX_WEEKS),
//       daysBeforeUnpublished: ONE_DAY,
//       unpublishDate: unpublishedDateOneDayAway,
//     },
//     {
//       annualReviewStartDate: subDays(today, SIX_WEEKS),
//       daysBeforeUnpublished: 0,
//       unpublishDate: today,
//     },
//   ];
//
//   // fill in the dates between 1 to 5 weeks from the todayDateString
//   for (let daysBeforeUnpublished = ONE_WEEK; daysBeforeUnpublished <= FIVE_WEEKS; daysBeforeUnpublished += 7) {
//     const localUnpublishDate = addDays(today, daysBeforeUnpublished);
//     const unpublishDate = new Date(
//       Date.UTC(localUnpublishDate.getFullYear(), localUnpublishDate.getMonth(), localUnpublishDate.getDate(), 0, 0, 0)
//     );
//
//     const localAnnualReviewStartDate = subDays(unpublishDate, SIX_WEEKS);
//     const annualReviewStartDate = new Date(
//       Date.UTC(
//         localAnnualReviewStartDate.getFullYear(),
//         localAnnualReviewStartDate.getMonth(),
//         localAnnualReviewStartDate.getDate(),
//         0,
//         0,
//         0
//       )
//     );
//
//     unpublishedDateContextsForFiltering.push({
//       annualReviewStartDate,
//       daysBeforeUnpublished,
//       unpublishDate,
//     });
//   }
//   return unpublishedDateContextsForFiltering;
// }
//
// /**
//  * A list item will become unpbulished 6 weeks after the annual review start date.  This function calculates all the
//  * annual review start dates that align with the 0, 1, 7, 14, 21, 28, 35 days before being unpublished which are
//  * calculated relative to the todayDateString.  For each List emails will be sent to the consular post and associated
//  * providers registered on the List.
//  * @param todayDateString
//  */
// export async function sendUnpublishedEmails(todayDateString: string): Promise<void> {
//   const unpublishedDateContextsForFiltering = getUnpublishedDateContexts(todayDateString);
//
//   const annualReviewStartDates = unpublishedDateContextsForFiltering.map((context) => context.annualReviewStartDate);
//   const lists: List[] | undefined = await findListByAnnualReviewDate(annualReviewStartDates);
//   logger.info(`******FOUND ${lists?.length} LISTS with annual review dates [${lists?.map(list => list.nextAnnualReviewStartDate.toUTCString())}]  , matching annual review start dates [${annualReviewStartDates.map(date => date.toUTCString())}]`);
//
//   if (lists) {
//     for (const context of unpublishedDateContextsForFiltering) {
//       await sendEmails(lists.filter(list => list.nextAnnualReviewStartDate.toDateString() === context.annualReviewStartDate.toDateString()), context);
//     }
//   }
// }
//
// const todayDateString = SCHEDULED_PROCESS_TODAY_DATE;
//
// /**
//  * Entrypoint to the service.  Today's date is retrieved from the SCHEDULED_PROCESS_TODAY_DATE environment variable.
//  * This allows the process to be run relative to any date should it need to be rerun due to an error that occurred.
//  */
// sendUnpublishedEmails(todayDateString).then(r => {
//   logger.info(`Reason after scheduler: ${r}`);
//   process.exit(0);
//
// }).catch(r => logger.error(`Error reason after scheduler: ${r}`));
