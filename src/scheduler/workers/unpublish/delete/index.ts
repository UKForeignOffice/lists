import { startOfToday, subYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { schedulerLogger } from "scheduler/logger";

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
                type: "ANNUAL_REVIEW_OVERDUE",
                time: {
                  lte: dateOneYearAgo,
                },
              },
            },
          },
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

    const listItemsToDelete = itemsUnpublishedByAR.filter((item) => {
      const unpublishedIndex = item.history.findIndex((history) => history.type === "UNPUBLISHED");
      const publishedIndex = item.history.findIndex((history) => history.type === "PUBLISHED");

      if (publishedIndex === -1 || publishedIndex < unpublishedIndex) {
        return true;
      }

      return false;
    });

    if (listItemsToDelete.length === 0) {
      logger.info("No list items to delete");
      return;
    }

    await prisma.$transaction([
      prisma.audit.createMany({
        data: listItemsToDelete.map((item) => ({
          auditEvent: "DELETED",
          type: "listItem",
          jsonData: {
            annualReviewRef: item.reference,
            listId: item.listId,
            listItemId: item.id,
            notes: ["automated", "deleted due to non-response to annual review for over a year"],
          },
        })),
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
