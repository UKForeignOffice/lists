/**
 * Field(s) must be specified for non primitive macros, since they cannot be type checked for.
 */
import { Response } from "express";
import { findListItemById } from "server/models/listItem";
import { getListOverview } from "server/components/dashboard/listsItems/helpers";
import { ListItem } from "server/models/types";
import { Event } from "@prisma/client";

export type NonPrimitiveMacros = "link" | "emailAddress" | "phoneNumber" | "multiLineText";

/**
 * Can be checked for type in a "vanilla" way
 */
export type PrimitiveMacros = "boolean" | "array" | "string";

/**
 * Macros to help render rows
 */
export type Macro = NonPrimitiveMacros | PrimitiveMacros;

export interface govukRow {
  key: {
    text: string;
  };
  value: {
    text?: string;
    html?: string;
  };
  actions?: {
    items: Array<Record<string, string>>;
  } | null;
  type?: Macro;
}

export interface govukSummaryList {
  title?: string;
  rows: govukRow[];
}

export interface ListItemUrls {
  listItem: string;
  listIndex: string;
  listItemPublish: string;
  listItemUpdate: string;
  listItemRequestChanges: string;
  listItemDelete: string;
  listItemPin: string;
}

export interface ListItemConfirmationPage {
  path: string;
  postActionPageUrl: string;
}

export interface ListItemConfirmationPages {
  publish: ListItemConfirmationPage;
  unpublish: ListItemConfirmationPage;
  requestChanges: ListItemConfirmationPage;
  updateLive: ListItemConfirmationPage;
  updateNew: ListItemConfirmationPage;
  pin: ListItemConfirmationPage;
  unpin: ListItemConfirmationPage;
  remove: ListItemConfirmationPage;
}

type Unwrap<T> = T extends PromiseLike<infer U> ? U : T;
type UnwrapNull<T> = Exclude<T, null>;

interface ListLocals {
  list: Unwrap<ReturnType<typeof getListOverview>>;
  listIndexUrl: string;
  listEditUrl: string;
  title: string;
  [key: string]: any;
}

export type ListIndexRes = Response<any, ListLocals>;

export type ListItemRes = Response<
  any,
  ListLocals & {
    listItem: UnwrapNull<Unwrap<ReturnType<typeof findListItemById>>>;
  }
>;

export type ListItemWithHistory = ListItem & { history: Event[] };
