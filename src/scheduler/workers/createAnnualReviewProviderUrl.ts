import { ListItem } from "@prisma/client";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";

export function createAnnualReviewProviderUrl(listItem: ListItem): string {
  const protocol = isLocalHost ? "http" : "https";
  const host = `${protocol}://${SERVICE_DOMAIN}`;
  const path = `/annual-review/confirm/${listItem.reference}`;

  return `${host}${path}`;
}
