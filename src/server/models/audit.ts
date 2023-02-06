import { prisma } from "./db/prisma-client";
import { AuditEvent } from "@prisma/client";

import {
  AuditCreateInput, ListEventJsonData, ListItemEventJsonData
} from "./types";

/**
 * @deprecated
 * TODO: deprecate, this is handled by the history field
 */
export function recordListItemEvent(
  eventData: ListItemEventJsonData | ListEventJsonData,
  auditEvent: AuditEvent,
  type?: "user" | "list" | "listItem"
) {
  type = type ?? "listItem";
  const data: AuditCreateInput = {
    auditEvent,
    type,
    jsonData: { ...eventData },
  };

  return prisma.audit.create({ data });
}

export async function findAuditEvents(
  annualReviewReference: string,
  auditEvent: AuditEvent,
  type?: "user" | "list" | "listItem",
  itemId?: number,
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
    }];
  if (itemId) {
    andCondition.push(
      {
      jsonData: {
        path: ["itemId"],
        // @ts-ignore
        equals: itemId,
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

