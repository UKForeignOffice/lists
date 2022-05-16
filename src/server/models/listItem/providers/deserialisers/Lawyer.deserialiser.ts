import { WebhookDeserialisers } from "./types";
import { ServiceType } from "server/models/types";

export const lawyerDeserialiser: WebhookDeserialisers[ServiceType.lawyers] = (
  webhookData
) => {
  const { areasOfLaw = [], ...rest } = webhookData;
  return {
    areasOfLaw: areasOfLaw.filter(Boolean),
    ...rest,
  };
};
