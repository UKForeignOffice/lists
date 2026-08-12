import type { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import type { CountryName } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject, getCountryFromData } from "./geoHelpers";
import { baseDeserialiser, DESERIALISER } from "server/models/listItem/providers/deserialisers";
import type { WebhookData } from "server/components/formRunner";
import { checkListItemExists } from "server/models/listItem/providers/helpers";
import type { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
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
  const { type } = deserialised;
  const countryName = getCountryFromData(deserialised);

  const exists = await checkListItemExists({
    organisationName: deserialised.organisationName,
    countryName,
    addressFirstLine: deserialised["address.firstLine"],
    addressSecondLine: deserialised["address.secondLine"],
    city: deserialised.city,
    postCode: deserialised.postCode,
  });

  if (exists) {
    logger.warn(
      `listItemCreateInputFromWebhook: prevented duplicate ${type} application for "${deserialised.organisationName}" in ${countryName}`
    );
    throw new Error(`${type} record already exists`);
  }

  const listId = await getListIdForCountryAndType(countryName as CountryName, type);

  if (!listId) {
    logger.error(
      `listItemCreateInputFromWebhook: ${type}  list for ${countryName} could not be found`,
      "createListItem"
    );
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
