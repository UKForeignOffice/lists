import type { AnnualReviewPostEmailType } from "@prisma/client";
import { prisma } from "scheduler/prismaClient";
import { logger } from "scheduler/logger";

interface GetReminderEventsOptions {
  annualReviewReference: string;
  itemId?: number;
  annualReveiwStartDate?: Date;
}

export async function findAllReminderAudits({
  annualReviewReference,
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

/**
 *
 */
async function getMaxEmailTypeByReference(reference: string) {
  try {
    const result: Array<{ max: AnnualReviewPostEmailType }> = await prisma.$queryRaw`
      select max("annualReviewEmailType") from "Audit" where "jsonData"->>'annualReviewRef' = ${reference} and "annualReviewEmailType" is not null;
  `;

    return result?.at?.(0)?.max;
  } catch (e) {
    logger.error(`audit.getMaxEmailTypeByReference: ${e}`);
  }
}

export const audit = {
  getMaxEmailTypeByReference,
  findAll: findAllReminderAudits,
};
