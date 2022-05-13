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

export interface BaseDeserialisedWebhookData {
  country: string;
  "address.firstLine": string;
  "address.secondLine"?: string;
  city: string;
  postCode: string;

  size: string;
  speakEnglish: boolean;
  regulators: string;
  organisationName: string;
  websiteAddress?: string;

  contactName: string;
  emailAddress: string;
  publishEmail: string;
  publicEmailAddress?: string;
  phoneNumber: string;
  emergencyPhoneNumber?: string;
  declaration: string[];
  metadata: {
    type: ServiceType;
  };
}

export interface LawyersFormWebhookData extends BaseDeserialisedWebhookData {
  metadata: {
    type: ServiceType.lawyers;
  };
  regions: string;
  areasOfLaw: string[];
  legalAid?: boolean;
  proBono?: boolean;
  addressCountry: string;
  representedBritishNationals: boolean;
}

export interface CovidTestSupplierFormWebhookData
  extends BaseDeserialisedWebhookData {
  metadata: {
    type: ServiceType.covidTestProviders;
  };
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
}

export type DeserialisedWebhookData =
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
