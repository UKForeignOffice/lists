import { ServiceType } from "server/models/types";
import { WebhookDeserialiser } from "server/models/listItem/providers/types";
import { covidTestProviderDeserialiser } from "./CovidTestSupplier";
import { lawyerDeserialiser } from "./Lawyers";

export const deserialisers: Record<ServiceType, WebhookDeserialiser<any>> = {
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
  [ServiceType.lawyers]: lawyerDeserialiser,
};
