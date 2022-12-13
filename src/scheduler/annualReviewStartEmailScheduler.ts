// import { findListByAnnualReviewDate } from "server/models/list";
// import { Audit, List, ListItemGetObject } from "server/models/types";
// import { logger } from "server/services/logger";
// import { findListItemsForLists, updateAnnualReview } from "server/models/listItem";
// import { sendAnnualReviewPostEmail, sendAnnualReviewProviderEmail } from "server/services/govuk-notify";
// import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
// import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
// import { lowerCase, startCase } from "lodash";
// import { AuditEvent, ListItem, ListItemEvent, Status } from "@prisma/client";
// import { addDays } from "date-fns";
// import { recordListItemEvent } from "server/models/audit";
// import { SCHEDULED_PROCESS_TODAY_DATE } from "server/config";
// import { getTodayDate } from "./helpers";
//
// type ONE_MONTH = 28;
// type ONE_WEEK = 7;
// type ONE_DAY = 1;
// type TODAY = 0;
//
// type Milestones = TODAY | ONE_DAY | ONE_WEEK | ONE_MONTH;
//
// interface AnnualReviewStartDateContext {
//   startDate: Date;
//   daysBeforeStart: Milestones;
//   datePart: string;
// }
//
// type MilestonesHelper = (listId: number) => Promise<ReturnTypeAudit>>;
//
// /**
//  * @TODO Replace auditEvent with new ScheduledProcessEmail table that will act as an audit of emails seent and can be
//  * used by a worker process to do the actual email transmission.
//  * @param context
//  * @param list
//  */
// async function addAuditEventForEmail(context: AnnualReviewStartDateContext, listId: number) {
//   const postEvents: Record<Milestones, MilestonesHelper> = {
//     0: (listId: number) =>
//       recordListItemEvent(
//         {
//           eventName: "sendAnnualReviewStartedPostEmail",
//           itemId: listId,
//         },
//         AuditEvent.ANNUAL_REVIEW_STARTED_POST_EMAIL_SENT,
//         "list"
//       ),
//     1: (listId: number) =>
//       recordListItemEvent(
//         {
//           eventName: "sendAnnualReviewOneDayReminderPostEmail",
//           itemId: listId,
//         },
//         AuditEvent.ANNUAL_REVIEW_START_ONE_DAY_REMINDER_POST_EMAIL_SENT,
//         "list"
//       ),
//     7: (listId: number) =>
//       recordListItemEvent(
//         {
//           eventName: "sendAnnualReviewOneWeekReminderPostEmail",
//           itemId: listId,
//         },
//         AuditEvent.ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_POST_EMAIL_SENT,
//         "list"
//       ),
//     28: (listId: number) =>
//       recordListItemEvent(
//         {
//           eventName: "sendAnnualReviewOneMonthReminderPostEmail",
//           itemId: listId,
//         },
//         AuditEvent.ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_POST_EMAIL_SENT,
//         "list"
//       ),
//   };
//
//   await postEvents[context.daysBeforeStart](listId);
// }
//
// async function emailPosts(
//   listItemsEligibleForAnnualReview: ListItem[],
//   list: List,
//   context: AnnualReviewStartDateContext
// ) {
//   if (!listItemsEligibleForAnnualReview) {
//     logger.error(`No list items for list ${list.id} eligible for annual review`);
//     return;
//   }
//   if (!list.jsonData.publishers) {
//     logger.error(`No publishers found for list ${list.id}, cannot send annual review emails to post contacts`);
//     return;
//   }
//   const postEmailPromises = [];
//   for (const publisherEmail of list.jsonData.publishers) {
//     const promise = async (): Promise<{ result?: boolean, error?: Error }> => {
//       return await new Promise((resolve) => {
//         resolve(
//           sendAnnualReviewPostEmail(
//             context.daysBeforeStart,
//             publisherEmail,
//             lowerCase(startCase(list.type)),
//             list?.country?.name ?? "",
//             list.nextAnnualReviewStartDate.toDateString()
//           )
//         );
//       });
//     };
//     postEmailPromises.push(promise);
//   }
//   const sendResult = await Promise.allSettled(postEmailPromises);
//   const emailSent = sendResult.findOne((result) => result.status === "fulfilled" && result.value);
//
//   if (!emailSent) {
//     logger.error(`Unable to send annual review email to post contact ${publisherEmail}`);
//     return;
//   }
//   await addAuditEventForEmail(context, list.id);
// }
//
// async function emailProviders(updatedListItems: ListItem[], list: List, context: AnnualReviewStartDateContext) {
//   for (const updatedListItem of updatedListItems) {
//     // @TODO update correct landing page once latest annual review changes are merged in
//     const formRunnerEditUserUrl = await initialiseFormRunnerSession(
//       list,
//       updatedListItem as ListItemGetObject,
//       "update your annual review",
//       false
//     );
//
//     const providerEmailResult = await sendAnnualReviewProviderEmail(
//       context.daysBeforeStart,
//       (updatedListItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
//       lowerCase(startCase(updatedListItem.type)),
//       list?.country?.name ?? "",
//       (updatedListItem.jsonData as BaseDeserialisedWebhookData).contactName,
//       context.startDate.toDateString(),
//       formRunnerEditUserUrl
//     );
//
//     if (providerEmailResult.result) {
//       await recordListItemEvent(
//         {
//           eventName: "sendAnnualReviewStartedProviderEmail",
//           itemId: list.id,
//         },
//         AuditEvent.ANNUAL_REVIEW_STARTED_PROVIDER_EMAIL_SENT,
//         "listItem"
//       );
//     }
//   }
// }
//
// async function sendEmails(lists: List[], context: AnnualReviewStartDateContext): Promise<void> {
//   logger.info(
//     `[${lists.length}] lists identified ${
//       context.daysBeforeStart
//     }, days before annual review starts ${JSON.stringify(lists)}`
//   );
//
//   const listIds = lists.map((list) => list.id);
//   const findListItemsResult = await findListItemsForLists(listIds, ["PUBLISHED", "CHECK_ANNUAL_REVIEW"], false);
//   if (findListItemsResult.error) {
//     logger.error(`Unable to retrieve List Items for Lists ${listIds}: ${findListItemsResult.error.message}`);
//     return;
//   }
//   if (!findListItemsResult.result) {
//     logger.error(`No List Items found for Lists ${listIds}`);
//     return;
//   }
//   const listItemsForAllLists = findListItemsResult.result;
//   for (const list of lists) {
//     // get list items eligible for annual review
//     const listItemsEligibleForAnnualReview = listItemsForAllLists.filter((listItem) => listItem.listId === list.id);
//     logger.info(`checking list ${list.id} ${context.daysBeforeStart} ${context.datePart}
//     before annual review date ${list.nextAnnualReviewStartDate} with ${listItemsEligibleForAnnualReview.length}
//     listItems [${listItemsEligibleForAnnualReview.map((listItem) => listItem.id)}]
//     and publishers [${list.jsonData.publishers}]`);
//
//     if (!listItemsEligibleForAnnualReview.length) {
//       logger.info(`No list items identified for list ${list.id}, excludinmg from sending annual review emails`);
//       return;
//     }
//     await emailPosts(listItemsEligibleForAnnualReview, list, context);
//
//     if (context.daysBeforeStart === 0) {
//       // update list items and email providers to confirm annual review start
//       const updatedListItems: ListItem[] = await updateAnnualReview(
//         listItemsEligibleForAnnualReview,
//         Status.CHECK_ANNUAL_REVIEW,
//         ListItemEvent.ANNUAL_REVIEW_STARTED,
//         "startAnnualReview",
//         AuditEvent.ANNUAL_REVIEW
//       );
//       const listItemsNotUpdated = listItemsEligibleForAnnualReview.filter((listItem) => {
//         return updatedListItems.map((updatedListItem) => updatedListItem.id).includes(listItem.id);
//       });
//       if (listItemsNotUpdated) {
//         logger.info(`List items ${listItemsNotUpdated.map((listItem) => listItem.id)} could not be updated`);
//       }
//
//       await emailProviders(updatedListItems, list, context);
//     }
//   }
// }
//
// function getAnnualReviewStartDateContexts(todayDateString: string): AnnualReviewStartDateContext[] {
//   const today = getTodayDate(todayDateString);
//
//   const annualReviewStartDateContexts: AnnualReviewStartDateContext[] = [
//     {
//       startDate: addDays(today, ONE_MONTH),
//       daysBeforeStart: ONE_MONTH,
//       datePart: "day",
//     },
//     {
//       startDate: addDays(today, ONE_WEEK),
//       daysBeforeStart: ONE_WEEK,
//       datePart: "day",
//     },
//     {
//       startDate: addDays(today, ONE_DAY),
//       daysBeforeStart: ONE_DAY,
//       datePart: "day",
//     },
//     {
//       startDate: today,
//       daysBeforeStart: 0,
//       datePart: "day",
//     },
//   ];
//   return annualReviewStartDateContexts;
// }
//
// export async function sendAnnualReviewStartEmails(todayDateString: string): Promise<void> {
//   const annualReviewStartDateContexts = getAnnualReviewStartDateContexts(todayDateString);
//
//   const annualReviewStartDates = annualReviewStartDateContexts.map((context) => context.startDate);
//   const lists: List[] | undefined = await findListByAnnualReviewDate(annualReviewStartDates);
//   logger.info(`******FOUND ${lists?.length} LISTS matching annual review start dates [${annualReviewStartDates}]`);
//
//   if (lists) {
//     for (const context of annualReviewStartDateContexts) {
//       await sendEmails(
//         lists.filter(
//           (list) => list.nextAnnualReviewStartDate.toDateString() === context.startDate.toDateString()
//         ),
//         context
//       );
//     }
//   }
// }
//
// const todayDateString = SCHEDULED_PROCESS_TODAY_DATE;
//
// sendAnnualReviewStartEmails(todayDateString)
//   .then((r) => {
//     logger.info(`Reason after scheduler: ${r}`);
//     process.exit(0);
//   })
//   .catch((r) => {
//     logger.error(`Error reason after scheduler: ${r}`);
//     process.exit(1);
//   });
