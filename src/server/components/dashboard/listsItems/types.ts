/**
 * Field(s) must be specified for non primitive macros, since they cannot be type checked for.
 */
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
