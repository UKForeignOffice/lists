import type * as FormRunner from "server/components/formRunner";
import type { BaseDeserialisedWebhookData, WebhookDeserialiser } from "./types";
import { ServiceType } from "shared/types";
import { lawyerDeserialiser } from "server/models/listItem/providers/deserialisers/Lawyer.deserialiser";
import { trimAnswer } from "./helpers";
import { funeralDirectorDeserialiser } from "server/models/listItem/providers/deserialisers/FuneralDirector.deserialiser";
import { translatorInterpreterDeserialiser } from "server/models/listItem/providers/deserialisers/TranslatorInterpreter.deserialiser";
import { camelCase } from "lodash";

export function baseDeserialiser(webhookData: FormRunner.WebhookData): BaseDeserialisedWebhookData {
  /**
   * Deserialises to {@link #BaseDeserialisedWebhookData}
   */
  const { questions = [], metadata } = webhookData;
  let { type } = metadata;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  type = <ServiceType>camelCase(type);

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

export const DESERIALISER: Record<ServiceType, WebhookDeserialiser<any, any>> = {
  [ServiceType.lawyers]: lawyerDeserialiser,
  [ServiceType.funeralDirectors]: funeralDirectorDeserialiser,
  [ServiceType.translatorsInterpreters]: translatorInterpreterDeserialiser,
};
