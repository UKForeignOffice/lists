import { startOfToday, subYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { schedulerLogger } from "scheduler/logger";
import type { Event } from "shared/types";
import type { ListItemEvent, Prisma } from "@prisma/client";

export default async function deleteItemsAfterAYear() {
  const logger = schedulerLogger.child({ method: "deleteItemsAfterAYear" });

  try {
    const itemsUnpublishedByAR = await findUnpublishedItems();

    if (itemsUnpublishedByAR.length === 0) {
      logger.info("No list items to delete");
      return;
    }

    await prisma.$transaction([
      prisma.audit.createMany({
        // Data added to Audit table for list item since it's been removed therefore does not have any items in the Event table to connect to
        data: itemsUnpublishedByAR.map((item) => ({
          auditEvent: "DELETED",
          type: "listItem",
          jsonData: {
            annualReviewRef: (item.history[0] as Event).jsonData?.reference,
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

async function findUnpublishedItems() {
  const dateOneYearAgo = subYears(startOfToday(), 1);
  const unpublishedAYearAgo: Prisma.EventWhereInput = {
    type: "UNPUBLISHED",
    time: {
      lte: dateOneYearAgo,
    },
  };
  const histroyFilterEvents = (["UNPUBLISHED", "ANNUAL_REVIEW_OVERDUE"] as ListItemEvent[]).map((type) => ({
    history: {
      some: {
        type,
        time: {
          lte: dateOneYearAgo,
        },
      },
    },
  }));

  return await prisma.listItem.findMany({
    where: {
      status: "ANNUAL_REVIEW_OVERDUE",
      isAnnualReview: false,
      isPublished: false,
      AND: [
        ...histroyFilterEvents,
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
        take: 1,
        where: unpublishedAYearAgo,
        orderBy: {
          time: "desc",
        },
      },
    },
  });
}
