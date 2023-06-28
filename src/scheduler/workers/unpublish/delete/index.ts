import { startOfToday, subYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { schedulerLogger } from "scheduler/logger";
import type { ListItem, Event } from "shared/types";

export default async function deleteItemsAfterAYear() {
  const logger = schedulerLogger.child({ method: "deleteItemsAfterAYear" });

  try {
    const dateOneYearAgo = subYears(startOfToday(), 1);
    const itemsUnpublishedByAR = await prisma.listItem.findMany({
      where: {
        status: "ANNUAL_REVIEW_OVERDUE",
        isAnnualReview: false,
        isPublished: false,
        AND: [
          {
            history: {
              some: {
                type: "UNPUBLISHED",
                time: {
                  lte: dateOneYearAgo,
                },
              },
            },
          },
          {
            history: {
              some: {
                type: "ANNUAL_REVIEW_OVERDUE",
                time: {
                  lte: dateOneYearAgo,
                },
              },
            },
          },
          {
            history: {
              none: {
                type: "PUBLISHED",
                time: {
                  gte: dateOneYearAgo,
                },
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

    if (itemsUnpublishedByAR.length === 0) {
      logger.info("No list items to delete");
      return;
    }

    await prisma.$transaction([
      prisma.audit.createMany({
        data: itemsUnpublishedByAR.map((item) => ({
          auditEvent: "DELETED",
          type: "listItem",
          jsonData: {
            annualReviewRef: (item.history[getUnpublishedIndex(item)] as Event).jsonData?.reference,
            listId: item.listId,
            listItemId: item.id,
            notes: ["automated", "deleted due to non-response to annual review for over a year"],
          },
        })),
      }),

      prisma.listItem.deleteMany({
        where: {
          id: {
            in: itemsUnpublishedByAR.map((item) => item.id),
          },
        },
      }),
    ]);

    logger.info(`Deleted ${itemsUnpublishedByAR.length} list item(s)`);
  } catch (error) {
    logger.error(error);
  }
}

function getUnpublishedIndex(item: ListItem & { history: Array<{ type: string }> }) {
  return item.history.findIndex((history) => history.type === "UNPUBLISHED");
}
