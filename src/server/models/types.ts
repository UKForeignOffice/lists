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
export interface AnnualReviewKeyDates extends JsonObject {
  POST_ONE_MONTH: string;
  POST_ONE_WEEK: string;
  POST_ONE_DAY: string;
  START: string;
}
export interface UnpublishedKeyDates extends JsonObject {
  PROVIDER_FIVE_WEEKS: string;
  PROVIDER_FOUR_WEEKS: string;
  PROVIDER_THREE_WEEKS: string;
  PROVIDER_TWO_WEEKS: string;
  PROVIDER_ONE_WEEK: string;
  ONE_DAY_UNTIL_UNPUBLISH: string;
  UNPUBLISH: string;
}
export interface ScheduledProcessKeyDates extends JsonObject {
  annualReview: AnnualReviewKeyDates;
  unpublished: UnpublishedKeyDates;
}
export interface CurrentAnnualReview extends JsonObject {
  reference: string;
  eligibleListItems: number[];
  keyDates: ScheduledProcessKeyDates;
}
export interface ListJsonData extends JsonObject {
  users?: string[];
  currentAnnualReview?: CurrentAnnualReview;
}

export interface List extends PrismaClient.List {
  id: number;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  countryId: number;
  jsonData: ListJsonData;
  country?: Partial<Country>;
  isAnnualReview: boolean;
  nextAnnualReviewStartDate: Date;
  lastAnnualReviewStartDate: Date | null;
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
  Administrator = "Administrator",
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
export type AuditEventName = "edit" | "new";

export type AuditListItemEventName = "edit"
  | "new"
  | "requestChange"
  | "edit"
  | "approve"
  | "delete"
  | "pin"
  | "unpin"
  | "disapprove"
  | "publish"
  | "unpublish"
  | "startAnnualReview"
  | "reminder";

export type AuditListEventName = "edit" | "new" | "reminder";

export type ListAnnualReviewPostReminderType =
  | "sendOneMonthPostEmail"
  | "sendOneWeekPostEmail"
  | "sendOneDayPostEmail"
  | "sendStartedPostEmail";

export type ListItemAnnualReviewProviderReminderType = "sendStartedProviderEmail";

export type ListItemUnpublishedPostReminderType =
  | "sendUnpublishedPostEmail"
  | "sendUnpublishOneDayPostEmail"
  | "sendUnpublishWeeklyPostEmail";

export type ListItemUnpublishedProviderReminderType =
  | "sendUnpublishedProviderEmail"
  | "sendUnpublishOneDayProviderEmail"
  | "sendUnpublishWeeklyProviderEmail";

export type WebhookDataAsJsonObject<T> = T & JsonObject;

export interface EventJsonData extends JsonObject {
  eventName: AuditListItemEventName | AuditListEventName;
  userId?: User["id"];
  itemId: User["id"] | List["id"] | ListItem["id"];
  updatedJsonData?: ListItemJsonData;
  reminderType?:
    | ListAnnualReviewPostReminderType
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedPostReminderType
    | ListItemUnpublishedProviderReminderType;
  metadata?: PrismaClient.Prisma.JsonObject;
}

interface BaseAuditEventJsonData extends JsonObject {
  userId?: User["id"];
  itemId: ListItem["id"];
}

export interface ListItemEventJsonData extends BaseAuditEventJsonData {
  eventName: AuditListItemEventName;
  requestedChanges?: string;
  updatedJsonData?: ListItemJsonData;
  annualReviewRef?: string;
  reminderType?:
    | ListItemAnnualReviewProviderReminderType
    | ListItemUnpublishedPostReminderType
    | ListItemUnpublishedProviderReminderType;
}

export interface ListEventJsonData extends BaseAuditEventJsonData {
  eventName: AuditListEventName;
  annualReviewRef?: string;
  reminderType?: ListAnnualReviewPostReminderType;
}

export type AuditEventJsonData = ListItemEventJsonData | ListEventJsonData;

export interface Audit extends PrismaClient.Audit {
  jsonData: AuditEventJsonData;
}

export interface AuditCreateInput extends PrismaClient.Prisma.AuditCreateInput {
  type: "user" | "list" | "listItem";
  jsonData: AuditEventJsonData;
}

export interface AuditUpdateInput extends PrismaClient.Prisma.AuditUpdateInput {
  jsonData: AuditEventJsonData;
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
