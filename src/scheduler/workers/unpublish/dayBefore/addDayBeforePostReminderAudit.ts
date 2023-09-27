import { prisma } from "scheduler/prismaClient";
import type { AuditCreateInput, ListEventJsonData } from "server/models/types";
import type { AuditEvent, AnnualReviewPostEmailType } from "@prisma/client";

export async function addUnpublishPostReminderAudit(
  eventData: ListEventJsonData,
  auditEvent: AuditEvent,
  annualReviewEmailType: AnnualReviewPostEmailType
) {
  const data: AuditCreateInput = {
    auditEvent,
    type: "list",
    annualReviewEmailType,
    jsonData: { ...eventData },
  };

  return await prisma.audit.create({ data });
}
