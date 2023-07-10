import { ListItemEvent } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";

export async function findAllReminderEvents(annualReviewReference: string, itemId?: number) {
  const andCondition = [
    {
      type: ListItemEvent.REMINDER,
    },
    {
      jsonData: {
        path: ["reference"],
        equals: annualReviewReference,
      },
    },
    {
      ...(itemId && {
        listItemId: itemId,
      }),
    },
  ];

  try {
    const result = await prisma.event.findMany({
      take: 1,
      orderBy: {
        time: "desc",
      },
      where: {
        AND: andCondition,
      },
    });
    return { result };
  } catch (e) {
    const message = `Unable to find audit records: ${e.message}`;
    return { error: new Error(message) };
  }
}
