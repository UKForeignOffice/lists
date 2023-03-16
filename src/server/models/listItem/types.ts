import { JsonObject, List, ListItem, User } from "server/models/types";
import * as PrismaClient from "@prisma/client";
import {
  DeserialisedWebhookData,
  ListItemJsonData,
} from "server/models/listItem/providers/deserialisers/types";
import { Status } from "@prisma/client";



export enum ACTIVITY_TAGS {
  to_do = "to_do",
  out_with_provider = "out_with_provider",
  no_action_needed = "no_action_needed",
}

export enum PUBLISHING_TAGS {
  new = "new",
  live = "live",
  unpublished = "unpublished",
  archived = "archived"
}

export type Tags = typeof TAGS;

export const TAGS = {
  ...ACTIVITY_TAGS,
  ...PUBLISHING_TAGS,
};

export const ORDER_BY = {
  newest_first: "newest_first",
  last_updated: "last_updated",
  alphabetical_company_name: "alphabetical_company_name",
  alphabetical_contact_name: "alphabetical_contact_name",
} as const;

export type OrderBy = typeof ORDER_BY;

export interface ActivityStatusViewModel {
  type: "to_do" | "out_with_provider" | "no_action_needed",
  text: string,
  colour?: string
}

export type IndexListItem = Pick<ListItemJsonData, "organisationName" | "contactName" | "id"> & {
  createdAt: string;
  updatedAt: string;
  publishingStatus: string;
  activityStatus: ActivityStatusViewModel;
  lastPublished?: string;
  status: Status;
  isAnnualReview: boolean;
  history: PrismaClient.Event[];
};

export interface PaginationOptions {
  pagination?: {
    page?: number;
  };
}

export type ListIndexOptions = {
  listId: List["id"];
  userId?: User["id"];
  activity?: Array<keyof Tags>,
  publishing?: Array<keyof Tags>,
  sort?: keyof OrderBy;
  reqQuery?: Record<string, any>;
} & PaginationOptions;

export type EventName =
  | "new"
  | "requestChange"
  | "edit"
  | "delete"
  | "pin"
  | "unpin"
  | "disapprove"
  | "publish"
  | "unpublish"
  | "sendAnnualReviewReminderEmail"
  | "startAnnualReview"
  | "sendPostUnpublishReminderEmail"
  | "sendProviderUnpublishReminderEmail";

export type WebhookDataAsJsonObject<T> = T & JsonObject;

export interface EventJsonData extends JsonObject {
  eventName: EventName;
  userId?: User["id"];
  itemId: User["id"] | List["id"] | ListItem["id"];
  updatedJsonData?: DeserialisedWebhookData;

  metadata?: PrismaClient.Prisma.JsonObject;
}

export interface Event extends PrismaClient.Event {
  jsonData: EventJsonData;
}

export interface EventCreateInput extends PrismaClient.Prisma.EventCreateInput {
  jsonData: EventJsonData;
}

export type AnnualReviewBanner<BannerType extends "emailsSent" | "oneMonthWarning" | "unpublishWarning", V> =
  | { [Key in BannerType]: V }
  | undefined;
