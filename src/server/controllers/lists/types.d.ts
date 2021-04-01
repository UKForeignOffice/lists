export interface ListsRequestParams {
  serviceType?: string;
  country?: string;
  region?: string;
  practiceArea?: string | string[];
  legalAid?: "yes" | "no";
  readNotice?: string;
  readDisclaimer?: string;
}
