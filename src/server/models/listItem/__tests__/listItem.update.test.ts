import { update } from "./../listItem";
import { prisma } from "server/models/db/prisma-client";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/components/formRunner";

jest.mock("../../db/prisma-client");

const lawyerWebhookData: LawyersFormWebhookData = {
  country: "Spain",
  size: "Independent lawyer / sole practitioner",
  speakEnglish: true,
  regulators: "Spanish BAR",
  firstAndMiddleNames: "Lawyer In",
  familyName: "Spain",
  organisationName: "CYB Law",
  addressLine1: "123 Calle",
  city: "Seville",
  postcode: "S3V1LLA",
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
const covidTestProviderWebhookData: CovidTestSupplierFormWebhookData = {
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
    addressLine1: "Cogito, Ergo Sum",
    addressLine2: "Street",
    city: "Touraine",
    postcode: "123456",
    country: "france",
  },
  resultsReadyFormat: "Email,SMS",
  resultsFormat: "Email,SMS",
  bookingOptions: "Website,In Person",
  declarationConfirm: "confirm",
};

test("throws when the requested id does not exist", async () => {
  prisma.listItem.findFirst.mockRejectedValue(Error("mocked error"));

  await expect(update(40404, lawyerWebhookData)).rejects.toThrow(
    "list item 40404 not found"
  );
  await expect(update(40404, covidTestProviderWebhookData)).rejects.toThrow(
    "list item 40404 not found"
  );
});

test("getChangedAddressFields returns the correct changed fields for lawyers", () => {
  expect(update()).toBe({});
});

//TODO:- move to /providers/__test__
test("getChangedAddressFields returns the correct changed fields for covidTestProviders", () => {
  expect(update()).toBe({});
});

//TODO:- move
test("update throws when geoLocatePlaceByText fails", () => {
  expect(update()).toBe({});
});

test("address and geolocation tables are not queried when there are no address changes", () => {
  expect(update()).toBe({});
});

test("address and geolocation is updated when there are address changes", () => {
  expect(update()).toBe({});
});

test("jsonData is updated with the correct values", () => {
  expect(update()).toBe({});
});

test("throws when any query in transaction fails", () => {
  expect(update()).toBe({});
});
