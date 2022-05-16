import { LawyersFormWebhookData, WebhookDeserialiser } from "./types";

export const lawyerDeserialiser: WebhookDeserialiser<LawyersFormWebhookData> = (
  webhookData
) => {
  const { areasOfLaw = [], ...rest } = webhookData;
  return {
    areasOfLaw: areasOfLaw.filter(Boolean),
    ...rest,
  };
};
