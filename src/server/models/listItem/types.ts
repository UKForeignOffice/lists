import { JsonObject, List, ListItem, User } from "server/models/types";
import * as PrismaClient from "@prisma/client";
import {
  DeserialisedWebhookData,
  ListItemJsonData,
} from "server/models/listItem/providers/deserialisers/types";

/**
 * These are INCLUSIVE tags. Any combination of inclusive tags and one `ACTIVITY_TAG` is allowed.
 */
export enum INCLUSIVE_TAGS {
  pinned = "pinned",
  published = "published",
  // TODO: enable when ready
  // annual_review = "annual_review",
}

/**
 * These are EXCLUSIVE to each other. An application must be one or the other.
 */
export enum ACTIVITY_TAGS {
  to_do = "to_do",
  out_with_provider = "out_with_provider",
}

export type Tags = typeof TAGS;

export const TAGS = {
  ...ACTIVITY_TAGS,
  ...INCLUSIVE_TAGS,
};

export const ORDER_BY = {
  newest_first: "newest_first",
  last_updated: "last_updated",
  alphabetical_company_name: "alphabetical_company_name",
  alphabetical_contact_name: "alphabetical_contact_name",
} as const;

export type OrderBy = typeof ORDER_BY;

export type IndexListItem = Pick<
  ListItemJsonData,
  | "organisationName"
  | "contactName"
  | "publishers"
  | "validators"
  | "administrators"
  | "id"
> & {
  createdAt: string;
  updatedAt: string;
  status: string;
  tags: string[];
};

export interface PaginationOptions {
  pagination?: {
    page?: number;
  };
}

export type ListIndexOptions = {
  listId: List["id"];
  userId?: User["id"];
  tags?: Array<keyof Tags>;
  sort?: keyof OrderBy;
  reqQuery?: { [query: string]: any };
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
  | "unpublish";

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
