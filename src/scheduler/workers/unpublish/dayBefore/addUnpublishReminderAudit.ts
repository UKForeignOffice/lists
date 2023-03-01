import { prisma } from "server/models/db/prisma-client";
import {AuditCreateInput, ListEventJsonData, ListItemEventJsonData} from "server/models/types";
import {AuditEvent} from "@prisma/client";

export function recordListItemEvent(
  eventData: ListEventJsonData,
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
