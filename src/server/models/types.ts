import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";
import {
  ListItemJsonData,
  LawyerJsonData,
  CovidTestSupplierJsonData,
  FuneralDirectorJsonData,
  TranslatorInterpreterJsonData,
} from "./listItem/providers/deserialisers/types";
import { Event } from "./listItem/types";

export enum ServiceType {
  "covidTestProviders" = "covidTestProviders",
  "lawyers" = "lawyers",
  "funeralDirectors" = "funeralDirectors",
  "translatorsInterpreters" = "translatorsInterpreters",
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

export interface BaseListItemGetObject extends PrismaClient.ListItem {
  address: {
    firstLine: string;
    secondLine?: string;
    postCode?: string;
    city: string;
    country: {
      id: number;
      name: string;
    };
    geoLocationId?: number;
  };
  pinnedBy?: User[];
  history?: Event[];
}

export enum UserRoles {
  // Application Level Roles
  SuperAdmin = "SuperAdmin",
  ListsCreator = "ListsCreator",
}

type AsJsonObject<T> = T & JsonObject;

type StringLike<T extends string> = T | `${T}` | string;

export interface LawyerListItemCreateInput extends PrismaClient.Prisma.ListItemCreateInput {
  type: StringLike<ServiceType.lawyers>;
  jsonData: AsJsonObject<LawyerJsonData>;
}

export interface LawyerListItemGetObject extends BaseListItemGetObject {
  type: StringLike<ServiceType.lawyers>;
  jsonData: AsJsonObject<LawyerJsonData>;
}

export interface FuneralDirectorListItemCreateInput extends PrismaClient.Prisma.ListItemCreateInput {
  type: StringLike<ServiceType.funeralDirectors>;
  jsonData: AsJsonObject<FuneralDirectorJsonData>;
}

export interface FuneralDirectorListItemGetObject extends BaseListItemGetObject {
  type: StringLike<ServiceType.funeralDirectors>;
  jsonData: AsJsonObject<FuneralDirectorJsonData>;
}

export interface CovidTestSupplierListItemCreateInput extends PrismaClient.Prisma.ListItemCreateInput {
  type: StringLike<ServiceType.covidTestProviders>;
  jsonData: AsJsonObject<CovidTestSupplierJsonData>;
}

export interface TranslatorInterpreterListItemGetObject extends BaseListItemGetObject {
  type: StringLike<ServiceType.translatorsInterpreters>;
  jsonData: AsJsonObject<TranslatorInterpreterJsonData>;
}

export interface CovidTestSupplierListItemGetObject extends BaseListItemGetObject {
  type: StringLike<ServiceType.covidTestProviders>;
  jsonData: AsJsonObject<CovidTestSupplierJsonData>;
}

export type ListItemGetObject =
  | CovidTestSupplierListItemGetObject
  | LawyerListItemGetObject
  | FuneralDirectorListItemGetObject
  | TranslatorInterpreterListItemGetObject;

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
  | "new"
  | "requestChange"
  | "edit"
  | "approve"
  | "delete"
  | "pin"
  | "unpin"
  | "disapprove"
  | "publish"
  | "unpublish";

export type WebhookDataAsJsonObject<T> = T & JsonObject;

export interface EventJsonData extends JsonObject {
  eventName: AuditListItemEventName;
  userId?: User["id"];
  itemId: User["id"] | List["id"] | ListItem["id"];
  updatedJsonData?: ListItemJsonData;
  metadata?: PrismaClient.Prisma.JsonObject;
}

export interface Audit extends PrismaClient.Audit {
  jsonData: EventJsonData;
}

export interface AuditCreateInput extends PrismaClient.Prisma.AuditCreateInput {
  type: "user" | "list" | "listItem";
  jsonData: EventJsonData;
}

export interface AuditUpdateInput extends PrismaClient.Prisma.AuditUpdateInput {
  jsonData: EventJsonData;
}

// Feedback
export interface Feedback extends PrismaClient.Feedback {}

export interface FeedbackJsonData extends JsonObject {
  questionsAndAnswers: Array<{
    question: string;
    answer: string | number | boolean | undefined;
  }>;
  metadata?: PrismaClient.Prisma.JsonObject;
}

export interface FeedbackCreateInput extends PrismaClient.Prisma.FeedbackCreateInput {
  jsonData: FeedbackJsonData;
}

export interface FeedbackUpdateInput extends PrismaClient.Prisma.FeedbackUpdateInput {
  jsonData: FeedbackJsonData;
}
