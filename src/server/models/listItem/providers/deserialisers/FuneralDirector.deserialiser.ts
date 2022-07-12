import { WebhookDeserialisers } from "./types";
import { ServiceType } from "server/models/types";
import { checkboxCSVToArray } from "server/models/listItem/providers/deserialisers/helpers";

export const funeralDirectorDeserialiser: WebhookDeserialisers[ServiceType.funeralDirectors] =
  (webhookData) => {

  const { localServicesProvided = [], repatriationServicesProvided = [], religiousCulturalServicesProvided, ...rest } = webhookData;
  return {
    localServicesProvided: checkboxCSVToArray(localServicesProvided),
    // @ts-ignore
    repatriationServicesProvided: checkboxCSVToArray(repatriationServicesProvided),
    religiousCulturalServicesProvided,
    ...rest,
  };
};
