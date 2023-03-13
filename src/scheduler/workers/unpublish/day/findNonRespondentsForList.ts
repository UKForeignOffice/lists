import { prisma } from "server/models/db/prisma-client";
import { schedulerLogger } from "scheduler/logger";
import { List, Prisma } from "@prisma/client";
import { ListJsonData } from "server/models/types";
import { parseISO } from "date-fns";

export async function findNonRespondentsForList(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList", timeframe: "day" });

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const reminderToFind = parseISO(keyDates.unpublished.UNPUBLISH);
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();

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
  });

  logger.info(
    `Found ${listItems.length} items to send unpublish reminder ${
      listItems.length === 0
        ? `(already sent for period starting >= ${reminderToFind})`
        : [listItems.map((listItem) => listItem.id)]
    }`
  );

  return listItems;
}
