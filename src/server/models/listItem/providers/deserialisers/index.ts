import * as FormRunner from "server/components/formRunner";
import { BaseDeserialisedWebhookData, WebhookDeserialiser } from "./types";
import { ServiceType } from "server/models/types";
import { lawyerDeserialiser } from "server/models/listItem/providers/deserialisers/Lawyer.deserialiser";
import { covidTestProviderDeserialiser } from "server/models/listItem/providers/deserialisers/covidTestSupplier.deserialiser";
import { trimAnswer } from "./helpers";

export function baseDeserialiser(
  webhookData: FormRunner.WebhookData
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

export const DESERIALISER: Record<
  ServiceType,
  WebhookDeserialiser<any, any>
> = {
  [ServiceType.lawyers]: lawyerDeserialiser,
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
};
