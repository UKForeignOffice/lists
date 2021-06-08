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

// List
export interface ListJsonData extends PrismaClient.Prisma.JsonObject {
  editors: string[];
  publishers: string[];
}

export interface List extends PrismaClient.List {
  jsonData: ListJsonData;
  country?: Partial<Country>;
}

export interface ListCreateInput extends PrismaClient.Prisma.ListCreateInput {
  jsonData: ListJsonData;
}

export interface ListUpdateInput extends PrismaClient.Prisma.ListUpdateInput {
  jsonData: ListJsonData;
}

// ListItem
export type ListItem = PrismaClient.ListItem;

export interface ListItemGetObject extends PrismaClient.ListItem {
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
export enum UserRoles {
  SuperAdmin = "SuperAdmin",
  ListsAdmin = "ListsAdmin",
  ListPublisher = "ListPublisher",
  ListEditor = "ListEditor",
}

export interface UserJsonData extends PrismaClient.Prisma.JsonObject {
  roles?: UserRoles[];
}

export interface User extends PrismaClient.User {
  jsonData: UserJsonData;
}

export interface UserCreateInput extends PrismaClient.Prisma.UserCreateInput {
  jsonData: UserJsonData;
}

export interface UserUpdateInput extends PrismaClient.Prisma.UserUpdateInput {
  jsonData: UserJsonData;
}

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
