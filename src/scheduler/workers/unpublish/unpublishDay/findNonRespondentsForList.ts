import { prisma } from "server/models/db/prisma-client";
import { ListJsonData } from "server/models/types";
import { schedulerLogger } from "scheduler/logger";
import { List, Prisma } from "@prisma/client";
import { findReminderToSend } from "./findReminderToSend";
import {Meta} from "../types";

export async function findNonRespondentsForList(list: List, meta: Meta) {
  const logger = schedulerLogger.child({ listId: list.id, method: "findNonRespondentsForList" });

  const jsonData = list.jsonData as ListJsonData;
  const { keyDates } = jsonData.currentAnnualReview!;
  const { unpublished } = keyDates;
  logger.info(`unpublish date ${unpublished.UNPUBLISH}`);

  const { reminderToFind } = findReminderToSend(list);
  const annualReviewDate = new Date(list.nextAnnualReviewStartDate!).toISOString();

  const editedSinceAnnualReviewDate: Prisma.EventWhereInput = {
    type: "EDITED",
    time: {
      gte: annualReviewDate,
    },
  };

  // filters on notes to enable testing using the "Delorian"
  const reminderHasBeenSent: Prisma.EventWhereInput = {
    type: "REMINDER",
    jsonData: {
      path: ["notes"],
      array_contains: [`sent reminder for ${meta.daysUntilUnpublish} days until unpublish`],
    },
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
