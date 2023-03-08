import { prisma } from "server/models/db/prisma-client";
import { schedulerLogger } from "scheduler/logger";
import { List, Prisma } from "@prisma/client";
import { findReminderToSend } from "./findReminderToSend";

export async function findNonRespondentsForList(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const { reminderToFind } = findReminderToSend(list);
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();

  const editedSinceAnnualReviewDate: Prisma.EventWhereInput = {
    type: {
      in: ["EDITED", "CHECK_ANNUAL_REVIEW"],
    },
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
    `Found ${listItems.length} items to send day before unpublish reminder ${
      listItems.length === 0
        ? `(already sent for period starting >= ${reminderToFind})`
        : [listItems.map((listItem) => listItem.id)]
    }`
  );

  return listItems;
}
