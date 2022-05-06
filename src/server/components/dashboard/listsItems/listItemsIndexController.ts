import { NextFunction, Request, Response } from "express";
import { DEFAULT_VIEW_PROPS } from "server/components/lists/constants";
import { findIndexListItems } from "server/models/listItem/listItem";
import { TAGS, ORDER_BY, Tags } from "server/models/listItem/types";
import { getCSRFToken } from "server/components/cookies/helpers";

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

// TODO:- for sorting
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  tag: Array<keyof Tags> | keyof Tags;
  // TODO:- sorting
  sort?: string;
}

interface SanitisedIndexQuery extends IndexQuery {
  tag: Array<keyof Tags>;
  page: number;
}

function stripUnknownTags(tags: Array<keyof Tags>): Array<keyof Tags> {
  const acceptedTags = Object.keys(TAGS);
  return tags.filter((tag) => acceptedTags.includes(tag));
}

function normalisePageQueryParam(pageParam: any): number {
  if (Number.isInteger(pageParam)) {
    return Math.abs(pageParam);
  }
  return 1;
}

function sanitiseListItemsQueryParams(query: IndexQuery): SanitisedIndexQuery {
  const { page, tag } = query;
  const tagsAsArray = Array.isArray(tag) ? tag : [tag];

  return {
    tag: stripUnknownTags(tagsAsArray),
    page: normalisePageQueryParam(page),
  };
}

export async function listItemsIndexController(
  req: Request<IndexParams, {}, {}, IndexQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const sanitisedQueryParams = sanitiseListItemsQueryParams(req.query);
    const { tag: queryTag, page } = sanitisedQueryParams;

    const list = await findIndexListItems({
      listId: Number(listId),
      userId: req.user?.userData.id,
      pagination: {
        page,
      },
      tags: queryTag,
      reqQuery: sanitisedQueryParams,
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
      // @ts-expect-error
      csrfToken: getCSRFToken(req as Request),
    });
  } catch (error) {
    next(error);
  }
}
