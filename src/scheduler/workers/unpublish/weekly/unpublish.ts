import {type List} from "@prisma/client";
import {differenceInWeeks, parseISO, startOfDay, startOfToday} from "date-fns";
import {prisma} from "server/models/db/prisma-client";
import {type ListJsonData} from "server/models/types";
import {logger} from "server/services/logger";

export async function findListsInAnnualReview() {
  const today = startOfToday().toISOString();
  return prisma.list.findMany({
    where: {
      nextAnnualReviewStartDate: {
        lte: today,
        not: null
      },
      items: {
        some: {
          isAnnualReview: true,
        },
      },
    },
  });
}

export async function findNonRespondentsForList(list: List) {
  const log = logger.child({listId: list.id, method: "findNonRespondentsForList" })

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates, reference } = jsonData.currentAnnualReview;
  const { unpublished } = keyDates;
  const unpublishDate = startOfDay(parseISO(unpublished.UNPUBLISH));
  log.info(`unpublish date ${unpublished.UNPUBLISH}`)

  const today = startOfToday();
  const weeksUntilUnpublish = differenceInWeeks(unpublishDate, today);
  log.info(`Unpublish date is ${weeksUntilUnpublish} weeks away`)
  const weeksBeforeUnpublishToQuery: Record<number, Date> = {
    5: unpublished.PROVIDER_FIVE_WEEKS,
    4: unpublished.PROVIDER_FOUR_WEEKS,
    3: unpublished.PROVIDER_THREE_WEEKS,
    2: unpublished.PROVIDER_TWO_WEEKS,
    1: unpublished.ONE_WEEK,
  }

  const reminderToFind = weeksBeforeUnpublishToQuery[weeksUntilUnpublish];
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();
  log.info(`looking for list items to send unpublish provider reminder at ${weeksUntilUnpublish} weeks`)
  const listItems = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      isAnnualReview: true,
      status: "OUT_WITH_PROVIDER",
      history: {
        none: {
          // no "edited" event found after annual review began
          AND: [
            {
              type: "EDITED",
              time: {
                gte: annualReviewDate,
              }
            },
            {
              type: "REMINDER",
              time: {
                gte: reminderToFind
              }
            }
          ],
        },
      },
    },
    include: {
      ...includeCountryName,
      history: {
        where: {
          type: "REMINDER",
          time: {
            gte: annualReviewDate,
          }
        },
        orderBy: {
          time: "asc",
        },
      }
    }
  })


  log.info(`Found ${listItems.length} items to send unpublish reminder [${listItems.map(listItem => listItem.id)}]`)
  return {listItems, meta: {weeksUntilUnpublish, reference}};
}
const includeCountryName = {
  address: {
    include: {
      country: {
        select: {
          name: true
        }
      }
    }
  }
}
