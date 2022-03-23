import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "../src/server/components/formRunner";

export const lawyer: LawyersFormWebhookData = {
  country: "Spain",
  size: "Independent lawyer / sole practitioner",
  speakEnglish: true,
  regulators: "Spanish BAR",
  firstAndMiddleNames: "Lawyer In",
  familyName: "Spain",
  organisationName: "CYB Law",
  addressLine1: "70 King Charles Street",
  city: "London",
  postcode: "SW1A 2AH",
  addressCountry: "Spain",
  emailAddress: "lawyer@example.com",
  publishEmail: "Yes",
  phoneNumber: "+34123456789",
  emergencyPhoneNumber: "+34123456789",
  websiteAddress: "https://www.cyb-law.com",
  regions: "Seville, Malaga, Granada, Cadiz",
  areasOfLaw: [
    "Bankruptcy",
    "Corporate",
    "Criminal",
    "Employment",
    "Family",
    "Health",
    "Immigration",
    "Intellectual property",
    "International",
    "Maritime",
    "Personal injury",
    "Real estate",
    "Tax",
  ],
  legalAid: false,
  proBono: false,
  representedBritishNationals: true,
  declaration: ["confirm"],
};
export const covidTestProvider: CovidTestSupplierFormWebhookData = {
  speakEnglish: true,
  isQualified: true,
  affiliatedWithRegulatoryAuthority: true,
  regulatoryAuthority: "Health Authority",
  meetUKstandards: true,
  provideResultsInEnglishFrenchSpanish: true,
  provideTestResultsIn72Hours: true,
  providedTests:
    "Antigen, Loop-mediated Isothermal Amplification (LAMP), Polymerase Chain Reaction (PCR)",
  turnaroundTimeAntigen: "1",
  turnaroundTimeLamp: "48",
  turnaroundTimePCR: "24",
  organisationDetails: {
    organisationName: "Covid Test Provider Name",
    locationName: "London",
    contactName: "Contact Name",
    contactEmailAddress: "aa@aa.com",
    contactPhoneNumber: "777654321",
    websiteAddress: "www.website.com",
    emailAddress: "contact@email.com",
    phoneNumber: "777654321",
    addressLine1: "70 King Charles Street",
    addressLine2: undefined,
    city: "London",
    postcode: "SW1A 2AH",
    country: "france",
  },
  resultsReadyFormat: "Email,SMS",
  resultsFormat: "Email,SMS",
  bookingOptions: "Website,In Person",
  declarationConfirm: "confirm",
};

declare global {
  var webhookData: {
    lawyer: LawyersFormWebhookData;
    covidTestProvider: CovidTestSupplierFormWebhookData;
  };
}
