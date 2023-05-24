import type { ListEventJsonData, ListItemEventJsonData, AuditCreateInput } from "shared/types";
import type { AuditEvent } from "@prisma/client";
import { prisma } from "shared/prisma";

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
