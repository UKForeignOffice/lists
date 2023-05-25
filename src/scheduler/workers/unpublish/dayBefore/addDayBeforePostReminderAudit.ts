import { prisma } from "scheduler/prismaClient";
import { AuditCreateInput, ListEventJsonData } from "server/models/types";
import { AuditEvent } from "@prisma/client";

export async function addUnpublishPostReminderAudit(eventData: ListEventJsonData, auditEvent: AuditEvent) {
  const data: AuditCreateInput = {
    auditEvent,
    type: "list",
    jsonData: { ...eventData },
  };

  return await prisma.audit.create({ data });
}
