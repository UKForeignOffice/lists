import { WebhookDeserialisers } from "./types";
import { ServiceType } from "server/models/types";
import { checkboxCSVToArray } from "server/models/listItem/providers/deserialisers/helpers";

export const translatorInterpreterDeserialiser: WebhookDeserialisers[ServiceType.translatorsInterpreters] =
  (webhookData) => {

  const { deliveryOfServices = [], servicesProvided = [], translationSpecialties = [], interpreterServices = [], languagesProvided = [], ...rest } = webhookData;
  return {
    deliveryOfServices: checkboxCSVToArray(deliveryOfServices),
    servicesProvided: checkboxCSVToArray(servicesProvided),
    translationSpecialties: checkboxCSVToArray(translationSpecialties),
    interpreterServices: checkboxCSVToArray(interpreterServices),
    languagesProvided: checkboxCSVToArray(languagesProvided),
    ...rest,
  };
};
