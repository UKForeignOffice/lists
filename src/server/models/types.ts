import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Address = PrismaClient.Address;
export type Country = PrismaClient.Country;
export type ListItem = PrismaClient.ListItem;

interface LawyerExtendedProfile extends PrismaClient.Prisma.JsonObject {
  regulatoryAuthority?: string;
  outOfHours?: {
    telephone?: string;
    email?: string;
    address?: {
      firstLine: string;
      secondLine?: string;
      postCode: string;
      city: string;
    };
  };
}

export interface LawyerCreateObject {
  contactName: string;
  organisationName: string;
  telephone: string;
  email: string;
  website: string;
  address: {
    create: {
      firstLine: string;
      secondLine?: string;
      postCode: string;
      city: string;
      country: {
        connect: {
          id: number;
        };
      };
      geoLocationId?: number;
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
  extendedProfile: LawyerExtendedProfile;
  isApproved: boolean;
  isPublished: boolean;
}

interface ListItemCreateObject {
  type: string;
  address: {
    create: {
      firstLine: string;
      secondLine?: string;
      postCode: string;
      city: string;
      country: {
        connect: {
          id: number;
        };
      };
      geoLocationId?: number;
    };
  };
  isApproved?: boolean;
  isPublished?: boolean;
  isBlocked?: boolean;
}

export interface LawyerListItemCreateObject extends ListItemCreateObject {
  type: "lawyer";
  jsonData: {
    contactName: string;
    organisationName: string;
    telephone: string;
    email: string;
    website: string;
    legalPracticeAreas: string[];
    legalAid: boolean;
    proBonoService: boolean;
    regulatoryAuthority: string;
    englishSpeakLead: boolean;
    representedBritishNationalsBefore: boolean;
    outOfHours?: {
      telephone?: string;
      email?: string;
      address?: {
        firstLine: string;
        secondLine?: string;
        postCode: string;
        city: string;
      };
    };
  };
}

export type LegalAreas =
  | "bankruptcy"
  | "corporate"
  | "criminal"
  | "employment"
  | "family"
  | "health"
  | "immigration"
  | "intellectual property"
  | "international"
  | "maritime"
  | "personal injury"
  | "real estate"
  | "tax";
