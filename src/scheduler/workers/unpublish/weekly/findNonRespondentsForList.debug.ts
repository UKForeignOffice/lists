import { prisma } from "server/models/db/prisma-client";

export const findDebug = async (list, reminderHasBeenSent) => {
  const listItems = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      isAnnualReview: true,
      status: "OUT_WITH_PROVIDER",
      history: {
        some: {
          ...reminderHasBeenSent,
        },
      },
    },
    include: {
      history: {
        orderBy: {
          time: "desc",
        },
        where: {
          type: "REMINDER",
        },
      },
    },
  });

  console.log(
    `There are list items that have already been sent a reminder after ${reminderHasBeenSent.time.gte} for list ${list.id}, e.g:`,
    listItems[0]?.history?.[0]
  );
};
