import type * as PrismaClient from "@prisma/client";
import type * as ServerTypes from "server/models/types";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import type { EventJsonData } from "server/models/listItem/types";

export enum ServiceType {
  "lawyers" = "lawyers",
  "funeralDirectors" = "funeralDirectors",
  "translatorsInterpreters" = "translatorsInterpreters",
}

export type ListItem = PrismaClient.ListItem;

export interface List extends PrismaClient.List {
  id: number;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  countryId: number;
  jsonData: ServerTypes.ListJsonData;
  country?: Partial<ServerTypes.Country>;
  isAnnualReview: boolean;
  nextAnnualReviewStartDate: Date;
  lastAnnualReviewStartDate: Date | null;
}

export type ListItemWithHistory = ListItem & { history: PrismaClient.Event[] };

export interface CurrentAnnualReview extends PrismaClient.Prisma.JsonObject {
  reference: string;
  eligibleListItems: number[];
  keyDates: ServerTypes.ScheduledProcessKeyDates;
}

export interface Audit extends PrismaClient.Audit {
  jsonData: ServerTypes.AuditEventJsonData;
}

export type ListAnnualReviewPostReminderType =
  | "sendOneMonthPostEmail"
  | "sendOneWeekPostEmail"
  | "sendOneDayPostEmail"
  | "sendStartedPostEmail";

export interface ListEventJsonData extends ServerTypes.BaseAuditEventJsonData {
  eventName: ServerTypes.AuditListEventName;
  annualReviewRef?: string;
  reminderType?: ListAnnualReviewPostReminderType | ServerTypes.ListItemUnpublishedPostReminderType;
}

export type ListItemAnnualReviewProviderReminderType = "sendStartedProviderEmail";

export interface AuditCreateInput extends PrismaClient.Prisma.AuditCreateInput {
  type: "user" | "list" | "listItem";
  jsonData: ServerTypes.AuditEventJsonData;
}

export interface ListItemEventJsonData extends ServerTypes.BaseAuditEventJsonData {
  eventName: AuditListItemEventName;
  requestedChanges?: string;
  updatedJsonData?: ListItemJsonData;
  annualReviewRef?: string;
  reminderType?:
    | ListItemAnnualReviewProviderReminderType
    | ServerTypes.ListItemUnpublishedPostReminderType
    | ServerTypes.ListItemUnpublishedProviderReminderType;
}

export type AuditListItemEventName =
  | "edit"
  | "new"
  | "requestChange"
  | "approve"
  | "delete"
  | "pin"
  | "unpin"
  | "disapprove"
  | "publish"
  | "unpublish"
  | "startAnnualReview"
  | "reminder";

export interface RelatedLink extends PrismaClient.Prisma.JsonObject {
  url: string;
  text: string;
}

export interface ListJsonData extends PrismaClient.Prisma.JsonObject {
  users?: string[];
  currentAnnualReview?: CurrentAnnualReview;
  relatedLinks?: RelatedLink[];
}

export interface ListUpdateInput extends PrismaClient.Prisma.ListUpdateInput {
  jsonData: ListJsonData;
}

export interface NotifyResult {
  statusText: string;
}

export interface Event extends PrismaClient.Event {
  jsonData: EventJsonData;
}
