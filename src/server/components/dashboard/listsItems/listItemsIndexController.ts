import {NextFunction, Request} from "express";
import {DEFAULT_VIEW_PROPS} from "server/components/lists/constants";
import {findIndexListItems} from "server/models/listItem/listItem";
import {ACTIVITY_TAGS, ORDER_BY, PUBLISHING_TAGS, TAGS, Tags} from "server/models/listItem/types";
import {getCSRFToken} from "server/components/cookies/helpers";
import {ListItemRes} from "server/components/dashboard/listsItems/types";

/**
 * TODO:- rename file to listItems. Currently listsitems for parity with existing code.
 */
interface TagVM { text: string; value: ACTIVITY_TAGS | PUBLISHING_TAGS }
const filtersViewModel = {
  activityStatus: [
    {
      text: "To do",
      value: TAGS.to_do,
    },
    {
      text: "With provider",
      value: TAGS.out_with_provider,
    },
    {
      text: "No action needed",
      value: TAGS.no_action_needed,
    },
  ],
  publishingStatus: [
    {
      text: "New",
      value: TAGS.new,
    },
    {
      text: "Live",
      value: TAGS.live,
    },
    {
      text: "Unpublished",
      value: TAGS.unpublished,
    }
  ]
}

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
  activity: Array<keyof Tags> | keyof Tags;
  publishing: Array<keyof Tags> | keyof Tags;
  // TODO:- sorting
  sort?: string;
}

interface SanitisedIndexQuery extends IndexQuery {
  activity: Array<keyof Tags>;
  publishing: Array<keyof Tags>;
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
  const { page, activity, publishing } = query;
  const activityAsArray = Array.isArray(activity) ? activity : [activity];
  const publishingAsArray = Array.isArray(publishing) ? publishing : [publishing];

  return {
    activity: stripUnknownTags(activityAsArray),
    publishing: stripUnknownTags(publishingAsArray),
    page: normalisePageQueryParam(page),
  };
}

export async function listItemsIndexController(
  req: Request<IndexParams, {}, {}, IndexQuery>,
  res: ListItemRes,
  next: NextFunction
): Promise<void> {
  try {
    const { id: listId } = res.locals.list!;
    const user = req.user!;

    const sanitisedQueryParams = sanitiseListItemsQueryParams(req.query);
    const { activity, publishing, page } = sanitisedQueryParams;
    const queryTag = [...activity, ...publishing];
    req.session.changeMessage = undefined;

    const list = await findIndexListItems({
      listId,
      userId: user.userData.id,
      pagination: {
        page,
      },
      activity,
      publishing,
      reqQuery: sanitisedQueryParams,
    });

    const withCheckedAttributeFromQuery = (tag: TagVM) => ({
      ...tag,
      checked: queryTag?.includes(tag.value),
    })

    if (list === undefined) {
      return next();
    }
    res.render("dashboard/lists-items", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      activityStatus: filtersViewModel.activityStatus.map(withCheckedAttributeFromQuery),
      publishingStatus: filtersViewModel.publishingStatus.map(withCheckedAttributeFromQuery),
      // @ts-expect-error
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}


