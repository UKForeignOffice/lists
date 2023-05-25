import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";
import {
  CovidTestSupplierJsonData,
  FuneralDirectorJsonData,
  LawyerJsonData,
  ListItemJsonData,
  TranslatorInterpreterJsonData,
} from "./listItem/providers/deserialisers/types";
import { Event } from "./listItem/types";
import * as SharedTypes from "shared/types";

export type List = SharedTypes.List;
export type ListItem = SharedTypes.ListItem;
export type Audit = SharedTypes.Audit;

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
  ONE_WEEK: string;
  ONE_DAY: string;
  UNPUBLISH: string;
}

export interface ScheduledProcessKeyDates extends JsonObject {
  annualReview: AnnualReviewKeyDates;
  unpublished: UnpublishedKeyDates;
}

export type CurrentAnnualReview = ListItem;

export type ListJsonData = SharedTypes.ListJsonData;

export interface ListCreateInput extends PrismaClient.Prisma.ListCreateInput {
  jsonData: ListJsonData;
}

export type ListUpdateInput = SharedTypes.ListUpdateInput;

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
  type: StringLike<SharedTypes.ServiceType.lawyers>;
  jsonData: AsJsonObject<LawyerJsonData>;
}

export interface LawyerListItemGetObject extends BaseListItemGetObject {
  type: StringLike<SharedTypes.ServiceType.lawyers>;
  jsonData: AsJsonObject<LawyerJsonData>;
}

export interface FuneralDirectorListItemCreateInput extends PrismaClient.Prisma.ListItemCreateInput {
  type: StringLike<SharedTypes.ServiceType.funeralDirectors>;
  jsonData: AsJsonObject<FuneralDirectorJsonData>;
}

export interface FuneralDirectorListItemGetObject extends BaseListItemGetObject {
  type: StringLike<SharedTypes.ServiceType.funeralDirectors>;
  jsonData: AsJsonObject<FuneralDirectorJsonData>;
}

export interface CovidTestSupplierListItemCreateInput extends PrismaClient.Prisma.ListItemCreateInput {
  type: StringLike<SharedTypes.ServiceType.covidTestProviders>;
  jsonData: AsJsonObject<CovidTestSupplierJsonData>;
}

export interface TranslatorInterpreterListItemGetObject extends BaseListItemGetObject {
  type: StringLike<SharedTypes.ServiceType.translatorsInterpreters>;
  jsonData: AsJsonObject<TranslatorInterpreterJsonData>;
}

export interface CovidTestSupplierListItemGetObject extends BaseListItemGetObject {
  type: StringLike<SharedTypes.ServiceType.covidTestProviders>;
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
  email: string;
}

export interface UserCreateInput extends PrismaClient.Prisma.UserCreateInput {
  jsonData: UserJsonData;
}

export interface UserUpdateInput extends PrismaClient.Prisma.UserUpdateInput {
  jsonData: UserJsonData;
}

// Audit
export type AuditEventName = "edit" | "new";

export type AuditListEventName = "edit" | "new" | "reminder" | "endAnnualReview";

export type ListAnnualReviewPostReminderType = SharedTypes.ListAnnualReviewPostReminderType;

export type ListItemAnnualReviewProviderReminderType = SharedTypes.ListItemAnnualReviewProviderReminderType;

export type ListItemUnpublishedPostReminderType =
  | "sendUnpublishedPostEmail"
  | "sendUnpublishOneDayPostEmail"
  | "sendUnpublishWeeklyPostEmail";

export type ListItemUnpublishedProviderReminderType =
  | "sendUnpublishedProviderEmail"
  | "sendUnpublishOneDayProviderEmail"
  | "sendUnpublishWeeklyProviderEmail";

export type WebhookDataAsJsonObject<T> = T & JsonObject;

export type AuditListItemEventName = SharedTypes.AuditListItemEventName;

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

export interface BaseAuditEventJsonData extends JsonObject {
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

export type ListEventJsonData = SharedTypes.ListEventJsonData;

export type AuditEventJsonData = ListItemEventJsonData | ListEventJsonData;

export type AuditCreateInput = SharedTypes.AuditCreateInput;

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
