import { AuditEvent, type User } from "@prisma/client";
import type { List, RelatedLink } from "shared/types";
import { prisma } from "server/models/db/prisma-client";

type Actions = "Added" | "Edited" | "Removed";
type RelatedLinkWithBeforeState = RelatedLink & {
  before?: RelatedLink;
};
export async function addRelatedLinkUpdateAudit(
  userId: User["id"],
  listId: List["id"],
  action: Actions,
  update?: RelatedLinkWithBeforeState
) {
  return await prisma.audit.create({
    data: {
      type: "list",
      auditEvent: AuditEvent.LIST_EDIT,
      jsonData: {
        user: userId,
        notes: [`${action} a related link`],
        update,
      },
    },
  });
}
