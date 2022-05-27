import * as FormRunner from "server/components/formRunner";
import { BaseDeserialisedWebhookData, WebhookDeserialiser } from "./types";
import { ServiceType } from "server/models/types";
import { lawyerDeserialiser } from "server/models/listItem/providers/deserialisers/Lawyer.deserialiser";
import { covidTestProviderDeserialiser } from "server/models/listItem/providers/deserialisers/covidTestProvider.deserialiser";
import { trimAnswer } from "./helpers";
import {
  funeralDirectorDeserialiser
} from "server/models/listItem/providers/deserialisers/FuneralDirector.deserialiser";

export function baseDeserialiser(
  webhookData: FormRunner.WebhookData
): BaseDeserialisedWebhookData {
  /**
   * Deserialises to {@link #BaseDeserialisedWebhookData}
   */
  const { questions = [], metadata } = webhookData;
  const { type } = metadata;

  const parsed = questions
    .flatMap((question) => {
      const { fields = [], category } = question;
      return fields.map((field) => {
        const { key, answer } = field;
        const keyName = category ? `${category}.${key}` : key;
        return {
          [keyName]: trimAnswer(answer),
        };
      });
    })
    .reduce((acc, entry) => {
      return { ...acc, ...entry };
    }, {}) as BaseDeserialisedWebhookData;

  return { ...parsed, type };
}

export const DESERIALISER: Record<
  ServiceType,
  WebhookDeserialiser<any, any>
> = {
  [ServiceType.lawyers]: lawyerDeserialiser,
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
  [ServiceType.funeralDirectors]: funeralDirectorDeserialiser,
};
