import { BaseWebhookData } from "server/components/formRunner";
import { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject } from "server/models/listItem/providers/Lawyers";
import { deserialisers } from "./deserialisers";

export async function listItemCreateInputFromWebhook(
  webhook: BaseWebhookData
): Promise<Prisma.ListItemCreateInput> {
  const { metadata, ...rest } = webhook;
  const { type } = metadata;

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

  const deserialiser = deserialisers[type];
  const deserialised = deserialiser(rest);

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
