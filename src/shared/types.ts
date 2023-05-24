import type * as PrismaClient from "@prisma/client";
import type * as ServerTypes from "server/models/types";
// ListItem

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
