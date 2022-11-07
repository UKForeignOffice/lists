import {ActivityStatusViewModel, IndexListItem, ListIndexOptions, Tags} from "server/models/listItem/types";
import { List } from "server/models/types";
import { PaginationResults } from "server/components/lists";
import { calculatePagination, tagQueryFactory } from "server/models/listItem/queryFactory";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { getPaginationValues } from "server/models/listItem/pagination";
import { ListItem, Prisma, Status, Event, ListItemEvent } from "@prisma/client";
import { format } from "date-fns";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";


const statusToActivityVM: Record<Status, ActivityStatusViewModel> = {
  NEW: {
    type: 'to_do',
    text: 'Check new entry'
  },
  OUT_WITH_PROVIDER: {
    type: 'out_with_provider',
    text: 'edits requested'
  },
  EDITED: {
    text: 'Check edits',
    type: 'to_do'
  },
  CHECK_ANNUAL_REVIEW: {
    text: 'Check annual review',
    type: 'to_do'
  },
  ANNUAL_REVIEW_OVERDUE: {
    text: 'Annual review overdue',
    type: 'out_with_provider'
  },
  PUBLISHED: {
    text: 'No action needed',
    type: 'no_action_needed'
  },
  UNPUBLISHED: {
    text: 'Removed by post',
    type: 'to_do'
  },
}


enum PUBLISHING_STATUS {
  new = "new",
  live = "live",
  unpublished = "unpublished",
  archived = "archived"
}

function newestEventOfTypeIndex(history: Event[], type: ListItemEvent): number {
  return history.findIndex(event => event.type === type)
}

function hasBeenUnpublishedSincePublishing(history: Event[]): boolean {
  const newestPublishEvent = newestEventOfTypeIndex(history, ListItemEvent.PUBLISHED);
  const newestUnpublishEvent = newestEventOfTypeIndex(history, ListItemEvent.UNPUBLISHED);

  const hasUnpublishEvent = newestUnpublishEvent !== -1
  return  hasUnpublishEvent && newestUnpublishEvent < newestPublishEvent;
}

function getPublishingStatus(item: ListItemWithHistory): PUBLISHING_STATUS {

  if(item.isPublished) {
    return PUBLISHING_STATUS.live
  }

  if(hasBeenUnpublishedSincePublishing(item.history)) {
      return PUBLISHING_STATUS.unpublished
  }

  return PUBLISHING_STATUS.new

}

function wasUnpublishedByUser(history: Event[]): boolean {
  const event = history.find(event => event.type === 'UNPUBLISHED')
  const jsonData = event?.jsonData as Prisma.JsonObject;
  return !!jsonData.userId;
}

function getActivityStatus(item: ListItemWithHistory): ActivityStatusViewModel {
  const { history, status } = item;

  if(status === 'UNPUBLISHED') {
    if(wasUnpublishedByUser(history)) {
      return statusToActivityVM.UNPUBLISHED
    }
    return statusToActivityVM.ANNUAL_REVIEW_OVERDUE
  }

  if(status === 'PUBLISHED' && !item.isAnnualReview) {
    return statusToActivityVM.PUBLISHED
  }

  return statusToActivityVM[status]

}

type ListItemWithHistory = ListItem & {
  history: Event[]
}


/**
 * Use this as a viewmodel.
 */


function listItemsWithIndexDetails(item: ListItemWithHistory): IndexListItem {

  const { jsonData, createdAt, updatedAt, id } = item;
  const { organisationName, contactName } = jsonData as ListItemJsonData;

  return {
    createdAt: format(createdAt, "dd MMMM yyyy"),
    updatedAt: format(updatedAt, "dd MMMM yyyy"),
    organisationName,
    contactName,
    id,
    activityStatus: getActivityStatus(item),
    publishingStatus: getPublishingStatus(item),
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function findPinnedIndexListItems(options: ListIndexOptions) {
  return prisma.user.findUnique({
    where: {
      id: options.userId,
    },
    select: {
      pinnedItems: {
        where: {
          listId: options.listId,
          jsonData: { path: ["metadata", "emailVerified"], equals: true },
        },
      },
    },
  });
}

function getActiveQueries(
  tags: Array<keyof Tags>,
  options: ListIndexOptions
): { [prop in keyof Partial<Tags>]: Prisma.ListItemWhereInput[] } {
  return tags.reduce((prev, tag) => {
    return {
      ...prev,
      [tag]: tagQueryFactory[tag],
    };
  }, {});
}

export async function findIndexListItems(options: ListIndexOptions): Promise<
  {
    id: number;
    type: List["type"];
    country: List["country"];
    pinnedItems: IndexListItem[];
    items: IndexListItem[];
  } & PaginationResults
> {
  const { listId } = options;
  const { activity = [], publishing = [] } = options;
  const reqQueries = [...activity, ...publishing]

  // TODO:- need to investigate bug to do with take/skip on related entries. Seems to pull all of them regardless!
  // note: we are applying take/skip on List (i.e. take 20 Lists) rather than take 20 Items
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paginationOptions: {} | { take: number; skip: number } = calculatePagination(options);

  const activeQueries = getActiveQueries(reqQueries, options)

  const baseQuery = {
    where: {
      id: options.listId,
    },
    select: {
      type: true,
      country: true,
      jsonData: false,
      items: {
        where: {
          AND: [],
        },
      },
    },
  };
  let itemsWhereOr: Prisma.Enumerable<Prisma.ListItemWhereInput> = [];

  if (activeQueries.out_with_provider) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.out_with_provider);
  }

  if (activeQueries.live) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.live);
  }

  if (activeQueries.to_do) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.to_do);
  }

  baseQuery.select.items = {
    include: {
      history: true
    },
    orderBy: {
      updatedAt: "desc",
    },
    where: {
      AND: [
        {
          pinnedBy: {
            none: {
              // @ts-ignore
              id: options.userId,
            },
          },
          // @ts-ignore
          jsonData: { path: ["metadata", "emailVerified"], equals: true },
        },
      ],
    },
  };

  if (itemsWhereOr.length > 0) {
    const { AND } = baseQuery.select.items.where;
    // @ts-ignore
    baseQuery.select.items.where = {
      AND,
      // @ts-ignore
      OR: itemsWhereOr,
    };
  }
  const [result] = await prisma.$transaction([
    prisma.list.findUnique(baseQuery),
  ]);
  if (!result) {
    logger.error(`Failed to find ${listId}`);
    throw new Error(`Failed to find ${listId}`);
  }
  const { type, country, items } = result;

  const pagination = await getPaginationValues({
    count: result.items?.length ?? 0,
    rows: 20,
    route: "",
    page: options?.pagination?.page ?? 1,
    listRequestParams: options?.reqQuery,
  });
  return {
    id: listId,
    type,
    country,
    items: items.map(listItemsWithIndexDetails),
    ...pagination,
  };
}
