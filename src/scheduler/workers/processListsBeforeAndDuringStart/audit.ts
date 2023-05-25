import { prisma } from "scheduler/prismaClient";
import type { AuditEvent } from "@prisma/client";

export async function findAuditEvents(
  annualReviewReference: string,
  auditEvent: AuditEvent,
  type?: "user" | "list" | "listItem",
  itemId?: number
) {
  type = type ?? "listItem";

  const andCondition = [
    {
      type,
    },
    {
      jsonData: {
        path: ["annualReviewRef"],
        equals: annualReviewReference,
      },
    },
  ];
  if (itemId) {
    andCondition.push({
      jsonData: {
        path: ["itemId"],
        equals: `${itemId}`,
      },
    });
  }

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
