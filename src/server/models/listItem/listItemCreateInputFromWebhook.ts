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
import { createList } from "server/models/list";

export function deserialise(webhook: WebhookData): DeserialisedWebhookData {
  const baseDeserialised = baseDeserialiser(webhook);
  const { type } = baseDeserialised;
  const deserialiser = DESERIALISER[type];
  // just return the webhook object if no deserialiser can be found
  const deserialised = (deserialiser?.(baseDeserialised) ??
    webhook) as DeserialisedWebhookData;
  return deserialised;
}

export async function listItemCreateInputFromWebhook(
  webhook: WebhookData,
  skipAddressCreation: Boolean = false
): Promise<Prisma.ListItemCreateInput> {
  const deserialised = deserialise(webhook);
  const { type, country } = deserialised;

  const exists = await checkListItemExists({
    organisationName: deserialised.organisationName,
    countryName: deserialised.country,
  });

  if (exists) {
    throw new Error(`${type} record already exists`);
  }

  let listId = await getListIdForCountryAndType(country as CountryName, type);

  if (!listId) {
    logger.error(
      `list for ${country} and ${type} could not be found`,
      "createListItem"
    );
    /**
     *   country: CountryName;
     serviceType: ServiceType;
     validators: string[];
     publishers: string[];
     administrators: string[];
     createdBy: string;
     */
    await createList({
      country: country as CountryName,
      serviceType: type,
      validators: [],
      publishers: [],
      administrators: [],
      createdBy: "jen@cautionyourblast.com",
    });
  }

  listId = await getListIdForCountryAndType(country as CountryName, type);

  let address = {};

  if (!skipAddressCreation) {
    address = await createAddressObject(deserialised);
  }

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
    address,
  };
}
