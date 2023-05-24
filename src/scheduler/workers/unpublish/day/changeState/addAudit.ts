import { prisma } from "shared/prisma";
import type { AuditCreateInput, ListEventJsonData } from "shared/types";
import type { AuditEvent } from "@prisma/client";

export async function addAudit(eventData: ListEventJsonData, auditEvent: AuditEvent) {
  const data: AuditCreateInput = {
    auditEvent,
    type: "list",
    jsonData: { ...eventData },
  };

  return await prisma.audit.create({ data });
}
