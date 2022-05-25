import { WebhookDeserialisers } from "./types";
import { ServiceType } from "server/models/types";
import { checkboxCSVToArray } from "server/models/listItem/providers/deserialisers/helpers";

export const lawyerDeserialiser: WebhookDeserialisers[ServiceType.lawyers] = (
  webhookData
) => {
  const { areasOfLaw = [], ...rest } = webhookData;
  return {
    // @ts-ignore
    areasOfLaw: [...new Set(checkboxCSVToArray(areasOfLaw))],
    ...rest,
  };
};
