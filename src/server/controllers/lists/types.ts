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

export interface FormRunnerWebhookData {
  questions: Array<{
    question: string;
    category?: string;
    fields: Array<{
      key: string;
      title: string;
      type: string;
      answer: boolean | string | number | undefined;
    }>;
    index: number;
  }>;
}
