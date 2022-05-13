import { Prisma } from "@prisma/client";
import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName, ServiceType } from "server/models/types";
import { logger } from "server/services/logger";
import { createAddressObject } from "./geoHelpers";
import {
  BaseDeserialisedWebhookData,
  CovidTestSupplierFormWebhookData,
  DeserialisedWebhookData,
  FormRunnerField,
  FormRunnerWebhookData,
  LawyersFormWebhookData,
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
  const { areasOfLaw = [], ...rest } = webhookData;
  return {
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

function trimAnswer(
  answer: FormRunnerField["answer"]
): FormRunnerField["answer"] {
  if (typeof answer === "string") {
    return answer.trim();
  }
  return answer;
}

export function baseDeserialiser(
  webhookData: FormRunnerWebhookData
): BaseDeserialisedWebhookData {
  /**
   * Deserialises to {@link #BaseDeserialisedWebhookData}
   */
  const { questions, metadata } = webhookData;
  const { type } = metadata;

  const parsed = questions.reduce((acc, question) => {
    const { fields, category } = question;

    return fields.map((field) => {
      const { key, answer } = field;
      const keyName = category ? `${category}.${key}` : key;
      return {
        ...acc,
        [keyName]: trimAnswer(answer),
      };
    });
  }, {}) as BaseDeserialisedWebhookData;

  return { ...parsed, type };
}

export const DESERIALISER: Record<ServiceType, WebhookDeserialiser<any>> = {
  [ServiceType.lawyers]: lawyerDeserialiser,
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
};

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
