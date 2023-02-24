import { differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";
import { prisma } from "server/models/db/prisma-client";
import { ListJsonData } from "server/models/types";
import { logger } from "server/services/logger";
import { List, Prisma } from "@prisma/client";
import { findReminderToSend } from "./findReminderToSend";

export async function findNonRespondentsForList(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates, reference } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  log.info(`unpublish date ${unpublished.UNPUBLISH}`);

  const today = startOfToday();

  const { reminderToFind, weeksUntilUnpublish } = findReminderToSend(list);
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();

  log.debug(`${weeksUntilUnpublish} weeks until unpublish`);
  log.debug(`no event.time >= ${reminderToFind}`);

  if (weeksUntilUnpublish === 6) {
    return {};
  }

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
