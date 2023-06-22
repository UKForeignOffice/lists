import { addYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";

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

  for (const item of itemsUnpublishedByAR) {
    if (item.history[0].type === "UNPUBLISHED") {
      const timeLimit = addYears(item.history[0].time, 1);
    }
  }
}
