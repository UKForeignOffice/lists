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
  speakEnglish: boolean;
  englishSpeakLead: boolean;
  qualifiedToPracticeLaw: boolean;
  firstName: string;
  middleName: string | undefined;
  surname: string;
  organisationName: string;
  websiteAddress: string;
  emailAddress: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | undefined;
  city: string;
  postcode: string;
  country: string;
  areasOfLaw: string; // "Bankruptcy, Corporate, Criminal, ..."
  canProvideLegalAid: boolean;
  canOfferProBono: boolean;
  representedBritishNationalsBefore: boolean;
  memberOfRegulatoryAuthority: boolean;
  regulatoryAuthority: string;
  outOfHoursService: boolean;
  outOfHoursContactDetailsDifferent: boolean;
  outOfHoursContactDetailsDifferences: string; // "phoneNumber, address, email"
  outOfHours?: {
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode: string;
    country: string;
    emailAddress: string;
  };
  declarationConfirm: string; // "confirm"
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
    phoneNumber: string;
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
  bookingOptions: string;
  declarationConfirm: string;
}
