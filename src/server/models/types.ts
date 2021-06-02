import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";

export enum ServiceType {
  "lawyers" = "lawyers",
  "covidTestProvider" = "covidTestProvider",
}

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;

export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Address = PrismaClient.Address;
export type Country = PrismaClient.Country;
export type ListItem = PrismaClient.ListItem;
export type User = PrismaClient.User;

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

// User
export interface UserJsonData extends PrismaClient.Prisma.JsonObject {}

export interface UserCreateInput extends PrismaClient.Prisma.UserCreateInput {}

// Lawyer
export interface LawyerListItemJsonData extends PrismaClient.Prisma.JsonObject {
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
  metadata?: {
    emailVerified?: boolean;
  };
}

export interface LawyerListItemCreateInput
  extends PrismaClient.Prisma.ListItemCreateInput {
  type: ServiceType.lawyers;
  jsonData: LawyerListItemJsonData;
}

export interface LawyerListItemGetObject extends ListItemGetObject {
  type: ServiceType.lawyers;
  jsonData: LawyerListItemJsonData;
}

// Covid 19 Test Supplier
export interface CovidTestSupplierListItemJsonData
  extends PrismaClient.Prisma.JsonObject {
  contactName: string;
  organisationName: string;
  telephone: string;
  email: string;
  website: string;
  regulatoryAuthority: string;
  metadata?: {
    emailVerified?: boolean;
  };
}

export interface CovidTestSupplierListItemCreateInput
  extends PrismaClient.Prisma.ListItemCreateInput {
  type: ServiceType.covidTestProvider;
  jsonData: CovidTestSupplierListItemJsonData;
}

export interface CovidTestSupplierListItemGetObject extends ListItemGetObject {
  type: ServiceType.covidTestProvider;
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
