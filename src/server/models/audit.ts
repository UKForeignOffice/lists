import { prisma } from "./db/prisma-client";
import { Prisma, AuditEvent } from "@prisma/client";

import {
  Audit,
  AuditListItemEventName,
  AuditCreateInput,
  ListItem,
  User,
} from "./types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { logger } from "server/services/logger";

interface ListItemEventData {
  userId?: User["id"];
  itemId: ListItem["id"];
  eventName: AuditListItemEventName;
  requestedChanges?: string;
  updatedJsonData?: ListItemJsonData;
}

/**
 * @deprecated
 * TODO: deprecate, this is handled by the history field
 */
export function recordListItemEvent(
  eventData: ListItemEventData,
  auditEvent: AuditEvent
): Prisma.Prisma__AuditClient<Audit> {
  const data: AuditCreateInput = {
    auditEvent,
    type: "listItem",
    jsonData: { ...eventData },
  };

  logger.debug(`creating Audit record with data [${JSON.stringify(data)}`);
  return prisma.audit.create({ data }) as Prisma.Prisma__AuditClient<Audit>;
}
