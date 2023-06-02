import type { Response } from "express";
import type { RelatedLink } from "shared/types";

export type RelatedLinkLocals = {
  relatedLinkIndex: number | "new";
  relatedLink: RelatedLink;
};

export type RelatedLinkRes = Response<
  any,
  ListLocals & {
    listItem: UnwrapNull<Unwrap<ReturnType<typeof findListItemById>>>;
  }
>;
