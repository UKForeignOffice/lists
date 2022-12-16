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
  type?: "user" | "list" | "listItem"
) {
  type = type ?? "listItem";

  try {
    const result = await prisma.audit.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: {
        AND: [
          {
            type
          },
          {
            jsonData: {
              path: ["annualReviewRef"],
              equals: annualReviewReference
            }
          }
        ]
      }
    });
    return { result };
  } catch (e) {
    const message = `Unable to find audit records: ${e.message}`;
    return { error: new Error(message) };
  }
}

