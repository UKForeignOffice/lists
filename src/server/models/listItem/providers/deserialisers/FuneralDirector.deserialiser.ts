import { WebhookDeserialisers } from "./types";
import { ServiceType } from "server/models/types";
import { checkboxCSVToArray } from "server/models/listItem/providers/deserialisers/helpers";

export const funeralDirectorDeserialiser: WebhookDeserialisers[ServiceType.funeralDirectors] =
  (webhookData) => {

  const { repatriationServicesProvided = [], religiousCulturalServicesProvided = [], ...rest } = webhookData;
  return {
    // @ts-ignore
    repatriationServicesProvided: checkboxCSVToArray(repatriationServicesProvided),
    // @ts-ignore
    religiousCulturalServicesProvided: checkboxCSVToArray(religiousCulturalServicesProvided),
    ...rest,
  };
};
