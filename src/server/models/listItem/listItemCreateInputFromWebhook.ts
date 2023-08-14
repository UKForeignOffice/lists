import { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject } from "./geoHelpers";
import {
  baseDeserialiser,
  DESERIALISER,
} from "server/models/listItem/providers/deserialisers";
import { WebhookData } from "server/components/formRunner";
import { checkListItemExists } from "server/models/listItem/providers/helpers";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { EVENTS } from "./listItemEvent";

export function deserialise(webhook: WebhookData): DeserialisedWebhookData {
  const baseDeserialised = baseDeserialiser(webhook);
  const { type } = baseDeserialised;
  const deserialiser = DESERIALISER[type];
  // just return the webhook object if no deserialiser can be found
  const deserialised = (deserialiser?.(baseDeserialised) ?? webhook) as DeserialisedWebhookData;
  return deserialised;
}

export async function listItemCreateInputFromWebhook(
  webhook: WebhookData,
  skipAddressCreation: boolean = false
): Promise<Prisma.ListItemCreateInput> {
  const deserialised = deserialise(webhook);
  const { type, country } = deserialised;

  const exists = await checkListItemExists({
    organisationName: deserialised.organisationName,
    countryName: deserialised.addressCountry!,
  });

  if (exists) {
    throw new Error(`${type} record already exists`);
  }

  const listId = await getListIdForCountryAndType(country as CountryName, type);

  if (!listId) {
    logger.error(`listItemCreateInputFromWebhook: ${type}  list for ${country} could not be found`, "createListItem");
  }

  let address = {};

  if (!skipAddressCreation) {
    address = await createAddressObject(deserialised);
  }

  return {
    type,
    list: {
      connect: {
        id: listId,
      },
    },
    history: {
      create: [EVENTS.NEW()],
    },
    jsonData: {
      ...deserialised,
    },
    address,
  };
}
