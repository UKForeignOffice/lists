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

export interface LawyersFormWebhookData {
  country: string;
  size: string;
  speakEnglish: boolean;
  regulators: string;
  firstAndMiddleNames: string;
  familyName: string;
  organisationName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  addressCountry: string;
  emailAddress: string;
  publishEmail: string;
  publicEmailAddress?: string;
  phoneNumber: string;
  emergencyPhoneNumber?: string;
  websiteAddress?: string;
  regions: string;
  areasOfLaw: string[];
  legalAid?: boolean;
  proBono?: boolean;
  representedBritishNationals: boolean;
  declaration: string[];
}

export interface CovidTestSupplierFormWebhookData {
  speakEnglish: boolean;
  isQualified: boolean;
  affiliatedWithRegulatoryAuthority: boolean;
  regulatoryAuthority: string;
  meetUKstandards: boolean;
  provideResultsInEnglishFrenchSpanish: boolean;
  provideTestResultsIn72Hours: boolean;
  organisationDetails: {
    organisationName: string;
    locationName: string;
    contactName: string;
    contactEmailAddress: string;
    contactPhoneNumber: string;
    websiteAddress: string;
    emailAddress: string;
    additionalEmailAddress?: string;
    phoneNumber: string;
    additionalPhoneNumber?: string;
    addressLine1: string;
    addressLine2: string | undefined;
    city: string;
    postcode: string;
    country: string;
  };
  providedTests: string;
  turnaroundTimeAntigen: string;
  turnaroundTimeLamp: string;
  turnaroundTimePCR: string;
  resultsFormat: string;
  resultsReadyFormat: string;
  bookingOptions: string;
  declarationConfirm: string;
}

export interface FormRunnerComponent {
  name: string,
  title: string,
  options: {},
  type: string,
  content: string,
  schema: {}
}

export enum FormRunnerFields {
  "speakEnglish" = "speakEnglish",
  "firstAndMiddleNames" = "firstAndMiddleNames",
  "familyName" = "familyName",
  "organisationName" = "organisationName",
  "addressLine1" = "addressLine1",
  "addressLine2" = "addressLine2",
  "city" = "city",
  "postcode" = "postcode",
  "addressCountry" = "addressCountry",
  "websiteAddress" = "websiteAddress",
  "emailAddress" = "emailAddress",
  "publishEmail" = "publishEmail",
  "areasOfLaw" = "areasOfLaw",
  "legalAid" = "legalAid",
  "proBono" = "proBono",
  "representedBritishNationals" = "representedBritishNationals",
  "phoneNumber" = "phoneNumber",
  "emergencyPhoneNumber" = "emergencyPhoneNumber",
  "regulators" = "regulators",
  "declaration" = "declaration",
  "country" = "country",
  "regions" = "regions",
  "size" = "size",
  "publicEmailAddress" = "publicEmailAddress",
}

export type WebhookData =
  | CovidTestSupplierFormWebhookData
  | LawyersFormWebhookData;
