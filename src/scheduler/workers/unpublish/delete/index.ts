import { addYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { schedulerLogger } from "scheduler/logger";
import { EVENTS } from "server/models/listItem/listItemEvent";

export default async function deleteItemsAfterAYear() {
  const logger = schedulerLogger.child({ method: "deleteItemsAfterAYear" });

  try {
    const itemsUnpublishedByAR = await prisma.listItem.findMany({
      where: {
        status: "ANNUAL_REVIEW_OVERDUE",
        isAnnualReview: false,
        isPublished: false,
        AND: [
          {
            history: {
              some: {
                type: "ANNUAL_REVIEW_OVERDUE",
              },
            },
          },
          {
            history: {
              some: {
                type: "UNPUBLISHED",
              },
            },
          },
        ],
      },
      include: {
        history: {
          orderBy: {
            time: "desc",
          },
        },
      },
    });
    const today = new Date();
    const listItemsToDelete = itemsUnpublishedByAR.filter((item) => {
      const unpublishedHistory = item.history.find((historyItem) => historyItem.type === "UNPUBLISHED");
      const yearAfterUnpublish = addYears(unpublishedHistory!.time, 1);
      return today > yearAfterUnpublish;
    });

    if (listItemsToDelete.length === 0) {
      logger.info("No list items to delete");
      return;
    }

    await prisma.$transaction([
      prisma.event.createMany({
        // @ts-ignore
        data: listItemsToDelete.map((item) => EVENTS.DELETED(undefined, item.id)),
      }),
      prisma.listItem.deleteMany({
        where: {
          id: {
            in: listItemsToDelete.map((item) => item.id),
          },
        },
      }),
    ]);

    logger.info(`Deleted ${listItemsToDelete.length} list item(s)`);
  } catch (error) {
    logger.error(error);
  }
}
