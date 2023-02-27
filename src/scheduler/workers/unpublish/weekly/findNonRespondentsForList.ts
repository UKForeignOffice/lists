import { prisma } from "server/models/db/prisma-client";
import { ListJsonData } from "server/models/types";
import { logger } from "server/services/logger";
import { List, Prisma } from "@prisma/client";
import { findReminderToSend } from "./findReminderToSend";
import { findDebug } from "scheduler/workers/unpublish/weekly/findNonRespondentsForList.debug";

export async function findNonRespondentsForList(list: List) {
  const log = logger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  log.info(`unpublish date ${unpublished.UNPUBLISH}`);

  const { reminderToFind, weeksSinceStartDate } = findReminderToSend(list);
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();

  log.debug(`looking for list items with no reminder events with event.time >= ${reminderToFind}`);

  if (weeksSinceStartDate >= 6) {
    return [];
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

  if (listItems.length === 0) {
    await findDebug(list, reminderHasBeenSent);
  }

  return listItems;
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
