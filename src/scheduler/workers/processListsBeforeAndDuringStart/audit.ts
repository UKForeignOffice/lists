import { ListItemEvent } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";

interface GetReminderEventsOptions {
  annualReviewReference: string;
  itemId?: number;
  annualReveiwStartDate?: Date;
}

export async function findAllReminderEvents({
  annualReviewReference,
  itemId,
  annualReveiwStartDate,
}: GetReminderEventsOptions) {
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
    {
      ...(annualReveiwStartDate && {
        time: {
          gte: annualReveiwStartDate,
        },
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

export async function findAllReminderAudits({
  annualReviewReference,
  itemId,
  annualReveiwStartDate,
}: GetReminderEventsOptions) {
  const andCondition = [
    {
      type: "list",
    },
    {
      jsonData: {
        path: ["annualReviewRef"],
        equals: annualReviewReference,
      },
    },
    {
      ...(itemId && {
        jsonData: {
          path: ["itemId"],
          equals: itemId,
        },
      }),
    },
    {
      ...(annualReveiwStartDate && {
        createdAt: {
          gte: annualReveiwStartDate,
        },
      }),
    },
  ];

  try {
    const result = await prisma.audit.findMany({
      take: 1,
      orderBy: {
        createdAt: "desc",
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
