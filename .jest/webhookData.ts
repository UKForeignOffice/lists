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

declare global {
  var webhookData: {
    lawyer: LawyersFormWebhookData;
  };
}
