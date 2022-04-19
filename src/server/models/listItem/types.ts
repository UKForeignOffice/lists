import { LawyerListItemJsonData, List, User } from "server/models/types";
import { Request } from "express";

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

export type IndexListItem = Pick<
  LawyerListItemJsonData,
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

export type TagsAsKey = Array<keyof typeof TAGS> | keyof typeof TAGS;

export interface PaginationOptions {
  shouldPaginate?: boolean;
  pagination?: {
    page?: number;
  };
}

export type ListIndexOptions = {
  listId: List["id"];
  userId?: User["id"];
  tags?: TagsAsKey;
  reqQuery?: Request["query"];
} & PaginationOptions;
