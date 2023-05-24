import { ServiceType } from "shared/types";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/models/listItem/providers/deserialisers/types";

export const lawyer = {
  country: "Spain",
  size: "Independent lawyer / sole practitioner",
  speakEnglish: true,
  regulators: "Spanish BAR",
  contactName: "Lawyer In Spain",
  organisationName: "CYB Law",
  "address.firstLine": "70 King Charles Street",
  city: "London",
  postCode: "SW1A 2AH",
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
  metadata: {
    type: ServiceType.lawyers,
  },
};
export const covidTestProvider = {
  declaration: ["confirm"],
  publishEmail: "",
  regulators: "",
  size: "",
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
  organisationName: "Covid Test Provider Name",
  locationName: "London",
  contactName: "Contact Name",
  emailAddress: "aa@aa.com",
  phoneNumber: "777654321",
  websiteAddress: "www.website.com",
  publicEmailAddress: "contact@email.com",
  "address.firstLine": "70 King Charles Street",
  city: "London",
  postCode: "SW1A 2AH",
  country: "france",
  resultsReadyFormat: "Email,SMS",
  resultsFormat: "Email,SMS",
  bookingOptions: "Website,In Person",
  declarationConfirm: "confirm",
  metadata: {
    type: ServiceType.covidTestProviders,
  },
};

declare global {
  var webhookData: {
    lawyer: LawyersFormWebhookData;
    covidTestProvider: CovidTestSupplierFormWebhookData;
  };
}
