import { prisma } from "./db/prisma-client";
import { Prisma } from "@prisma/client";
import {
  Audit,
  AuditListItemEventName,
  AuditCreateInput,
  ListItem,
  User,
} from "./types";

interface ListItemEventData {
  userId: User["id"];
  itemId: ListItem["id"];
  eventName: AuditListItemEventName;
}

export function recordListItemEvent(
  eventData: ListItemEventData
): Prisma.Prisma__AuditClient<Audit> {
  const data: AuditCreateInput = {
    type: "listItem",
    jsonData: { ...eventData },
  };

  return prisma.audit.create({ data }) as Prisma.Prisma__AuditClient<Audit>;
}
