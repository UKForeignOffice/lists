import { addYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";
import { schedulerLogger as logger } from "scheduler/logger";

export default async function main() {
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

  logger.info(`main: ${itemsUnpublishedByAR.length} list items found that were unpublished by annual review`);

  for (const item of itemsUnpublishedByAR) {
    if (item.history[0].type === "UNPUBLISHED") {
      const timeLimit = addYears(item.history[0].time, 1);
      if (new Date() > timeLimit) {
        await prisma.listItem.delete({
          where: {
            id: item.id,
          },
        });
      }
    }
  }
}
