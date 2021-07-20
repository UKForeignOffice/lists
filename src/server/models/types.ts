import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";

export enum ServiceType {
  "lawyers" = "lawyers",
  "covidTestProviders" = "covidTestProviders",
}

export type JsonObject = PrismaClient.Prisma.JsonObject;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Address = PrismaClient.Address;
export type Country = PrismaClient.Country;

// List
export interface ListJsonData extends JsonObject {
  validators: string[];
  publishers: string[];
  administrators: string[];
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

export enum UserRoles {
  // Application Level Roles
  SuperAdmin = "SuperAdmin",
  ListsCreator = "ListsCreator",
}

// Lawyer ListItem
export interface LawyerListItemJsonData extends JsonObject {
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

// Covid 19 Test Supplier ListItem
export interface CovidTestSupplierListItemJsonData extends JsonObject {
  organisationName: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmailAddress: string;
  telephone: string;
  email: string;
  website: string;
  regulatoryAuthority: string;
  resultsFormat: string[];
  bookingOptions: string[];
  providedTests: Array<{
    type: string;
    turnaroundTime: number;
  }>;
  metadata?: {
    emailVerified?: boolean;
  };
}

export interface CovidTestSupplierListItemCreateInput
  extends PrismaClient.Prisma.ListItemCreateInput {
  type: ServiceType.covidTestProviders;
  jsonData: CovidTestSupplierListItemJsonData;
}

export interface CovidTestSupplierListItemGetObject extends ListItemGetObject {
  type: ServiceType.covidTestProviders;
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

// User
export interface UserJsonData extends JsonObject {
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

// Audit
export type AuditListItemEventName =
  | "approve"
  | "disapprove"
  | "publish"
  | "unpublish";

export interface AuditJsonData extends JsonObject {
  eventName: AuditListItemEventName;
  userId: User["id"];
  itemId: User["id"] | List["id"] | ListItem["id"];
  metadata?: PrismaClient.Prisma.JsonObject;
}

export interface Audit extends PrismaClient.Audit {
  jsonData: AuditJsonData;
}

export interface AuditCreateInput extends PrismaClient.Prisma.AuditCreateInput {
  type: "user" | "list" | "listItem";
  jsonData: AuditJsonData;
}

export interface AuditUpdateInput extends PrismaClient.Prisma.AuditUpdateInput {
  jsonData: AuditJsonData;
}
