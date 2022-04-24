import { prisma } from "./db/prisma-client";
import { Prisma, AuditEvent } from "@prisma/client";

import {
  Audit,
  AuditListItemEventName,
  AuditCreateInput,
  ListItem,
  User, WebhookDataAsJsonObject,
} from "./types";
import { CovidTestSupplierFormWebhookData, LawyersFormWebhookData } from "server/components/formRunner";

interface ListItemEventData {
  userId?: User["id"];
  itemId: ListItem["id"];
  eventName: AuditListItemEventName;
  requestedChanges?: string;
  updatedJsonData?: WebhookDataAsJsonObject<LawyersFormWebhookData> | WebhookDataAsJsonObject<CovidTestSupplierFormWebhookData>;
}

export function recordListItemEvent(
  eventData: ListItemEventData,
  auditEvent: AuditEvent
): Prisma.Prisma__AuditClient<Audit> {
  const data: AuditCreateInput = {
    auditEvent,
    type: "listItem",
    jsonData: { ...eventData },
  };

  return prisma.audit.create({ data }) as Prisma.Prisma__AuditClient<Audit>;
}
