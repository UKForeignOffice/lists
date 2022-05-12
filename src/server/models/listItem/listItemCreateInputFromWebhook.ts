import { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName, ServiceType } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject } from "./geoHelpers";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
  WebhookData,
} from "server/components/formRunner";
import {
  TestType,
  turnaroundTimeProperties,
  WebhookDeserialiser,
} from "server/models/listItem/providers/types";

import { checkboxCSVToArray } from "server/models/listItem/providers/helpers";

export const lawyerDeserialiser: WebhookDeserialiser<LawyersFormWebhookData> = (
  webhookData
) => {
  const { areasOfLaw = [], metadata, ...rest } = webhookData;
  return {
    metadata,
    areasOfLaw: areasOfLaw.filter(Boolean),
    ...rest,
  };
};

export const covidTestProviderDeserialiser: WebhookDeserialiser<CovidTestSupplierFormWebhookData> =
  (webhookData) => {
    const {
      providedTests: providedTestsString,
      resultsFormat,
      resultsReadyFormat,
      bookingOptions,
      metadata,
      ...rest
    } = webhookData;

    const providedTests = checkboxCSVToArray(providedTestsString).map(
      (testName) => {
        const type = testName as TestType;
        return {
          type,
          turnaroundTime: parseInt(turnaroundTimeProperties[type]),
        };
      }
    );

    return {
      ...rest,
      providedTests,
      resultsFormat: checkboxCSVToArray(resultsFormat),
      resultsReadyFormat: checkboxCSVToArray(resultsReadyFormat),
      bookingOptions: checkboxCSVToArray(bookingOptions),
      fastestTurnaround: Math.min(
        ...providedTests.map((test) => test.turnaroundTime)
      ),
    };
  };

export const DESERIALISER: Record<ServiceType, WebhookDeserialiser<any>> = {
  [ServiceType.lawyers]: lawyerDeserialiser,
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
};

export async function listItemCreateInputFromWebhook(
  webhook: WebhookData
): Promise<Prisma.ListItemCreateInput> {
  const { metadata } = webhook;
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

  const deserialiser = DESERIALISER[type];
  const deserialised = deserialiser(webhook);

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
