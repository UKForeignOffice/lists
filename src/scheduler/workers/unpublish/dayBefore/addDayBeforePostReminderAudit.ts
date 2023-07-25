import { prisma } from "scheduler/prismaClient";
import type { AuditCreateInput, ListEventJsonData } from "server/models/types";
import type { AuditEvent, PostEmailType } from "@prisma/client";

export async function addUnpublishPostReminderAudit(
  eventData: ListEventJsonData,
  auditEvent: AuditEvent,
  emailType: PostEmailType
) {
  const data: AuditCreateInput = {
    auditEvent,
    type: "list",
    emailType,
    jsonData: { ...eventData },
  };

  return await prisma.audit.create({ data });
}
