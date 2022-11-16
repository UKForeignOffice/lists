import { findListByAnnualReviewDate } from "server/models/list";
import {
  List, ListItemGetObject,
} from "server/models/types";
import { logger } from "server/services/logger";
import { findListItemsForLists, updateAnnualReview } from "server/models/listItem";
import { sendAnnualReviewPostEmail, sendAnnualReviewProviderEmail } from "server/services/govuk-notify";
import { BaseDeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { lowerCase, startCase } from "lodash";
import { Status } from "@prisma/client";
import { getAdjustedDateForDatePart } from "server/components/annualReview/helpers";

async function sendAdvancedNoticeToPostsDaysBeforeStart(lists: List[], dateBeforeAnnualReviewStart: Date, daysBeforeAnnualReviewStart: number): Promise<void> {
  const filteredList: List[] = lists.filter((list) => {
    return list.nextAnnualReviewStartDate.getTime() === dateBeforeAnnualReviewStart.getTime();
  });
  logger.info(`[${filteredList.length}] lists identied for ${dateBeforeAnnualReviewStart.toDateString()}, ${JSON.stringify(filteredList)}`);

  const listItemsForAllLists: ListItemGetObject[] = await findListItemsForLists(filteredList.map(list => list.id), [Status.PUBLISHED, Status.ANNUAL_REVIEW]);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() -1);
  oneMonthAgo.setHours(0, 0, 0, 0);
  const listItemsForListsMap = new Map<number, ListItemGetObject[]>();

  for (const list of filteredList) {
    // get list items eligible for annual review and assign to Map for use further down
    const listItemsEligibleForAnnualReview = listItemsForAllLists.filter(listItem => {
      const publishedHistory = listItem?.history
        ?.filter((event) => event.type === "PUBLISHED")
        .sort((a, b) => a.id - b.id)
        .pop();
      publishedHistory?.time?.setHours(0,0,0,0);
      return listItem.listId === list.id
        && (publishedHistory?.time ?? new Date()) < oneMonthAgo
    });
    listItemsForListsMap.set(list.id, listItemsEligibleForAnnualReview);

    // email post only if there are list items eligible for annual review
    if (listItemsEligibleForAnnualReview) {
      for (let publisherEmail of list.jsonData.publishers) {
        logger.info(`sending ${daysBeforeAnnualReviewStart} days before email to ${publisherEmail}, instead using ali@cautionyourblast.com`);
        publisherEmail = "ali@cautionyourblast.com";
        await sendAnnualReviewPostEmail(
          daysBeforeAnnualReviewStart,
          publisherEmail,
          lowerCase(startCase(list.type)),
          list?.country?.name ?? "",
          list?.nextAnnualReviewStartDate.toDateString() ?? dateBeforeAnnualReviewStart.toDateString()
        );
        // @ todo REMOVE THIS break ONCE TESTED
        if (1 === 1) break;
      }

      // update list items and email providers to confirm annual review start
      if (daysBeforeAnnualReviewStart === 0) {
        // const oneMonthListItems = await findListItemsForLists(filteredList);
        const deletionDate = getAdjustedDateForDatePart("day", 49);
        logger.debug(`******FOUND: ${listItemsEligibleForAnnualReview.length} list items for ${daysBeforeAnnualReviewStart} days before annual review`);
        const updatedListItem: ListItemGetObject[] = await updateAnnualReview(listItemsEligibleForAnnualReview);

        for(const listItem of updatedListItem) {
          const list = filteredList.find(list => list.id === listItem.listId);

          if (list) {
            logger.debug(`initialising form runner session`);
            const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem, "update your annual review", false);

            logger.debug(`sending provider email`);
            await sendAnnualReviewProviderEmail(0,
              (listItem.jsonData as BaseDeserialisedWebhookData).emailAddress,
              lowerCase(startCase(listItem.type)),
              list?.country?.name ?? "",
              (listItem.jsonData as BaseDeserialisedWebhookData).contactName,
              deletionDate.toDateString(),
              formRunnerEditUserUrl
            );
            // @todo REMOVE THIS break ONCE TESTED
            break;
          }
        }
      }
    }
  }
}

export async function sendAllAdvancedNoticesToPosts(): Promise<void> {
  // next annual review date
  const oneMonthTillStartDate = getAdjustedDateForDatePart("month", 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // @todo filter for status published and out for annual review AND exclude published in last month
  const lists: List[] | undefined = await findListByAnnualReviewDate(today, oneMonthTillStartDate);
  logger.info(`******FOUND ${lists?.length} LISTS`);

  if (lists) {
    const oneWeekTillStartDate = getAdjustedDateForDatePart("day", 7);
    const oneDayTillStartDate = getAdjustedDateForDatePart("day", 1);

    // one month
    await sendAdvancedNoticeToPostsDaysBeforeStart(lists, oneMonthTillStartDate, 30);
    await sendAdvancedNoticeToPostsDaysBeforeStart(lists, oneWeekTillStartDate, 7);
    await sendAdvancedNoticeToPostsDaysBeforeStart(lists, oneDayTillStartDate, 1);
    await sendAdvancedNoticeToPostsDaysBeforeStart(lists, today, 0);
  }
}
