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
export type ListItemCreateInput = PrismaClient.Prisma.ListItemCreateInput;

interface ListItemGetObject extends PrismaClient.ListItem {
  address: {
    firstLine: string;
    secondLine?: string;
    postCode: string;
    city: string;
    country: {
      id: number;
      name: string;
    };
    geoLocationId?: number;
  };
}

// Lawyer
interface LawyerListItemJsonData extends PrismaClient.Prisma.JsonObject {
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
}

export interface LawyerListItemCreateInput extends ListItemCreateInput {
  type: "lawyer";
  jsonData: LawyerListItemJsonData;
}

export interface LawyerListItemGetObject extends ListItemGetObject {
  type: "lawyer";
  jsonData: LawyerListItemJsonData;
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
