import { ServiceType } from "server/models/types";

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

export interface BaseWebhookData {
  country: string;
  size: string;
  speakEnglish: boolean;
  regulators: string;
  contactName: string;
  organisationName: string;
  "address.firstLine": string;
  "address.secondLine"?: string;
  city: string;
  postCode: string;
  addressCountry: string;
  emailAddress: string;
  publishEmail: string;
  publicEmailAddress?: string;
  phoneNumber: string;
  emergencyPhoneNumber?: string;
  websiteAddress?: string;
  representedBritishNationals: boolean;
  declaration: string[];
  metadata: {
    type: ServiceType;
  };
}

export interface LawyersFormWebhookData extends BaseWebhookData {
  regions: string;
  areasOfLaw: string[];
  legalAid?: boolean;
  proBono?: boolean;
}

export interface CovidTestSupplierFormWebhookData extends BaseWebhookData {
  isQualified: boolean;
  affiliatedWithRegulatoryAuthority: boolean;
  regulatoryAuthority: string;
  meetUKstandards: boolean;
  provideResultsInEnglishFrenchSpanish: boolean;
  provideTestResultsIn72Hours: boolean;
  locationName: string;
  providedTests: string;
  turnaroundTimeAntigen: string;
  turnaroundTimeLamp: string;
  turnaroundTimePCR: string;
  resultsFormat: string;
  resultsReadyFormat: string;
  bookingOptions: string;
  declarationConfirm: string;
}

export type WebhookData =
  | LawyersFormWebhookData
  | CovidTestSupplierFormWebhookData;

export interface FormRunnerPage {
  title: string;
  path: string;
  controller: string;
  components?: FormRunnerComponent[];
  section: string; // the section ID
  next?: Array<{ path: string; condition?: string }>;
}

export interface FormRunnerComponent {
  name: string;
  title: string;
  options: {};
  type: string;
  content: string;
  schema: {};
}

export interface FormRunnerField {
  key: string;
  answer: any;
}

export interface FormRunnerQuestion {
  question: string;
  fields: FormRunnerField[];
}

export interface FormRunnerNewSessionData {
  questions: Array<Partial<FormRunnerQuestion>> | undefined;
  options: {
    message: string;
    callbackUrl: string;
    redirectPath: string;
  };
  name: string;
}
