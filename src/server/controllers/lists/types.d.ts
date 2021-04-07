import { CountryName } from "server/models/types";

export interface ListsRequestParams {
  serviceType?: string;
  country?: CountryName | "";
  region?: string;
  practiceArea?: string | string[];
  legalAid?: "yes" | "no" | "";
  readNotice?: string;
  readDisclaimer?: string;
}
