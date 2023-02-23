import { differenceInWeeks, parseISO, startOfDay, startOfToday, startOfTomorrow } from "date-fns";
import { prisma } from "server/models/db/prisma-client";
import { ListJsonData } from "server/models/types";
import { logger } from "server/services/logger";
import { List, Prisma } from "@prisma/client";

export async function findNonRespondentsForList(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates, reference } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  const unpublishDate = startOfDay(parseISO(unpublished.UNPUBLISH));
  log.info(`unpublish date ${unpublished.UNPUBLISH}`);

  // const today = startOfTomorrow();
  const today = startOfToday();
  const weeksUntilUnpublish = differenceInWeeks(unpublishDate, today, { roundingMethod: "ceil" });

  log.info(`Unpublish date is ${weeksUntilUnpublish} weeks away`);
  const weeksBeforeUnpublishToQuery: { [n: number]: string } = {
    5: unpublished.PROVIDER_FIVE_WEEKS,
    4: unpublished.PROVIDER_FOUR_WEEKS,
    3: unpublished.PROVIDER_THREE_WEEKS,
    2: unpublished.PROVIDER_TWO_WEEKS,
    1: unpublished.ONE_WEEK,
    0: unpublished.UNPUBLISH,
  };

  const reminderToFind = weeksBeforeUnpublishToQuery[weeksUntilUnpublish];
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();
  log.debug(
    `looking for list items to send unpublish provider reminder at ${weeksUntilUnpublish} weeks (No events >= ${reminderToFind})`
  );

  log.debug(`${weeksUntilUnpublish} weeks until unpublish`);
  log.debug(`no event.time >= ${reminderToFind}`);

  const editedSinceAnnualReviewDate: Prisma.EventWhereInput = {
    type: "EDITED",
    time: {
      gte: annualReviewDate,
    },
  };

  const reminderHasBeenSent: Prisma.EventWhereInput = {
    type: "REMINDER",
    time: {
      gte: reminderToFind,
    },
  };

  const listItems = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      isAnnualReview: true,
      status: "OUT_WITH_PROVIDER",
      history: {
        none: {
          OR: [editedSinceAnnualReviewDate, reminderHasBeenSent],
        },
      },
    },
    include: {
      ...countryName,
    },
  });

  log.info(
    `Found ${listItems.length} items to send unpublish reminder ${
      listItems.length === 0 ? "(already sent for this period)" : [listItems.map((listItem) => listItem.id)]
    }`
  );

  return { listItems, meta: { weeksUntilUnpublish, reference } };
}

const countryName = {
  address: {
    include: {
      country: {
        select: {
          name: true,
        },
      },
    },
  },
};
