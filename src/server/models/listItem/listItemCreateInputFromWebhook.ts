import { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject } from "./geoHelpers";
import { DESERIALISER } from "server/models/listItem/providers/deserialisers";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";

export async function listItemCreateInputFromWebhook(
  webhook: DeserialisedWebhookData
): Promise<Prisma.ListItemCreateInput> {
  const { type } = webhook;

  const listId = await getListIdForCountryAndType(
    webhook.country as CountryName,
    type
  );

  if (!listId) {
    logger.error(
      `list for ${webhook.country} and ${type} could not be found`,
      "createListItem"
    );
  }

  const deserialiser = DESERIALISER[type];
  // just return the webhook object if no deserialiser can be found
  const deserialised = deserialiser?.(webhook) ?? webhook;

  return {
    type,
    isApproved: false,
    isPublished: false,
    list: {
      connect: {
        id: listId,
      },
    },
    jsonData: {
      ...deserialised,
    },
    address: {
      ...(await createAddressObject(webhook)),
    },
  };
}
