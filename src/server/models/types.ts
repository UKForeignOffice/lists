import Prisma from "@prisma/client";
import { countriesList } from "server/services/metadata";

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Lawyer = Prisma.Lawyer;
export type Address = Prisma.Address;

export interface LawyerCreateObject {
  contactName: string;
  lawFirmName: string;
  telephone: string;
  email: string;
  website: string;
  description?: string;
  address: {
    create: {
      firsLine: string;
      secondLine?: string;
      postCode: string;
      country: {
        connect: {
          id: number;
        };
      };
    };
  };
  legalPracticeAreas: {
    connectOrCreate: Array<{
      where: {
        name: string;
      };
      create: {
        name: string;
      };
    }>;
  };
  regionsServed?: string;
  legalAid: boolean;
  proBonoService: boolean;
  isApproved: boolean;
  isPublished: boolean;
}

export interface LawyerWebhookData {
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
