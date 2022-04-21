import { NextFunction, Request, Response } from "express";
import { DEFAULT_VIEW_PROPS } from "server/components/lists/constants";
import { findIndexListItems } from "server/models/listItem/listItem";
import { TAGS, ORDER_BY } from "server/models/listItem/types";

/**
 * TODO:- rename file to listItems. Currently listsitems for parity with existing code.
 */

const TagsViewModel = [
  {
    text: "To do",
    value: TAGS.to_do,
  },
  {
    text: "Out with provider",
    value: TAGS.out_with_provider,
  },
  /**
   * TODO:- restore when ready
    {
    text: "Annual review",
    value: TAGS.annual_review,
  }, */
  {
    text: "Published",
    value: TAGS.published,
  },
];

const SortViewModel = [
  {
    text: "Newest first",
    value: ORDER_BY.newest_first,
  },
  {
    text: "Last updated",
    value: ORDER_BY.last_updated,
  },
  {
    text: "Alphabetical (company name)",
    value: ORDER_BY.alphabetical_company_name,
  },
  {
    text: "Alphabetical (contact name)",
    value: ORDER_BY.alphabetical_contact_name,
  },
];

interface IndexParams {
  listId: string;
}

interface IndexQuery {
  page: string | number;
  tag: Array<keyof typeof TAGS> | keyof typeof TAGS;
  // TODO:- sorting
  sort?: string;
}

export async function listItemsIndexController(
  req: Request<IndexParams, {}, {}, IndexQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const { page, tag: queryTag, sort: querySort } = req.query;
    const list = await findIndexListItems({
      listId: Number(listId),
      userId: req.user?.userData.id,
      pagination: {
        page: Number(page ?? 1),
      },
      tags: queryTag,
      reqQuery: req.query,
    });

    if (list === undefined) {
      return next();
    }
    res.render("dashboard/lists-items", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      tags: TagsViewModel.map((tag) => ({
        ...tag,
        checked: queryTag?.includes(tag.value),
      })),
      sort: SortViewModel.map((sort) => ({
        ...sort,
        selected: querySort?.includes(sort.value),
      })),
    });
  } catch (error) {
    next(error);
  }
}
