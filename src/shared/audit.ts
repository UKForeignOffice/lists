import type { ListEventJsonData, ListItemEventJsonData, AuditCreateInput } from "shared/types";
import type { AuditEvent } from "@prisma/client";
import { prisma as serverPrisma } from "server/models/db/prisma-client";
import { prisma as schedulerPrisma } from "scheduler/prismaClient";

/**
 * @deprecated
 * TODO: deprecate, this is handled by the history field
 */
export function recordListItemEvent(
  eventData: ListItemEventJsonData | ListEventJsonData,
  auditEvent: AuditEvent,
  type?: "user" | "list" | "listItem",
  usedBy: "server" | "scheduler" = "server"
) {
  type = type ?? "listItem";
  const data: AuditCreateInput = {
    auditEvent,
    type,
    jsonData: { ...eventData },
  };

  const prisma = usedBy === "server" ? serverPrisma : schedulerPrisma;
  return prisma.audit.create({ data });
}
