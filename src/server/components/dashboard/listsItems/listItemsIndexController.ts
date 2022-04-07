import { NextFunction, Request, Response } from "express";
import { findIndexListItems } from "server/models/listItem";
import { DEFAULT_VIEW_PROPS } from "server/components/lists/constants";

/**
 * TODO:- rename file to listItems. Currently listsitems for parity with existing code.
 */

enum ITEM_TAGS {
  to_do = "to_do",
  published = "published",
  annual_review = "annual_review",
  pinned = "pinned",
  out_with_provider = "out_with_provider",
}

/**
 * These are INCLUSIVE tags. Any combination of inclusive tags and one `ACTIVITY_TAG` is allowed.
 */
type INCLUSIVE_TAGS = "pinned" | "published" | "annual_review";

/**
 * These are EXCLUSIVE to each other. An application must be one or the other.
 */
type ACTIVITY_TAGS = "to_do" | "out_with_provider";

type TAGS = INCLUSIVE_TAGS & ACTIVITY_TAGS;

export async function listItemsIndexController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const { page } = req.query;
    const list = await findIndexListItems(Number(listId), {
      page: Number(page ?? 1),
    });

    if (list === undefined) {
      return next();
    }

    res.render("dashboard/lists-items", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      tags: [],
    });
  } catch (error) {
    next(error);
  }
}
