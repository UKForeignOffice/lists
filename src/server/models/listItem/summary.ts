import { IndexListItem, ListIndexOptions, TAGS, Tags } from "server/models/listItem/types";
import { List } from "server/models/types";
import { PaginationResults } from "server/components/lists";
import { calculatePagination, tagQueryFactory } from "server/models/listItem/queryFactory";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { getPaginationValues } from "server/models/listItem/pagination";
import { ListItem, Prisma, Status, Event, ListItemEvent } from "@prisma/client";
import { format } from "date-fns";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";


// TODO: we should start implementing i18n.
const dictionary: Record<Status, string> = {
  NEW: 'check new entry',
  OUT_WITH_PROVIDER: 'edits requested',
  EDITED: 'check edits',
  ANNUAL_REVIEW: '',
  REVIEW_OVERDUE: 'annual review overdue',
  REVIEWED: 'REVIEWED',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
}



const publishingStatusDictionary: Record<string, string> = {
  isPublished: 'live',
  unpublished: 'unpublished',
}

enum PUBLISHING_STATUS {
  new = "new",
  live = "live",
  unpublished = "unpublished",
  archived = "archived"
}

function newestEventOfType(history: Event[], type: ListItemEvent): number {
  return history.findIndex(event => event.type === type)
}



function hasBeenUnpublishedSincePublishing(history: Event[]): boolean {
  const newestPublishEvent = newestEventOfType(history, ListItemEvent.PUBLISHED)
  const newestUnpublishEvent = newestEventOfType(history, ListItemEvent.UNPUBLISHED)
  return newestUnpublishEvent !== -1 && newestUnpublishEvent < newestPublishEvent;

}

function getPublishingStatus(item: ListItemWithHistory) {

  if(item.isPublished) {
    return PUBLISHING_STATUS.live
  }

  if(item.status === Status.NEW) {
    return PUBLISHING_STATUS.new
  }

  if(hasBeenUnpublishedSincePublishing(item.history)) {
      return PUBLISHING_STATUS.unpublished
  }



}

type ListItemWithHistory = ListItem & {
  history: Event[]
}


/**
 * Use this as a viewmodel.
 */


function listItemsWithIndexDetails(item: ListItemWithHistory): IndexListItem {

  const { jsonData, createdAt, updatedAt, id, status } = item;
  const { organisationName, contactName } = jsonData as ListItemJsonData;

  return {
    createdAt: format(createdAt, "dd MMMM yyyy"),
    updatedAt: format(updatedAt, "dd MMMM yyyy"),
    organisationName,
    contactName,
    id,
    activityStatus: dictionary[status],
    publishingStatus: getPublishingStatus(item),
    status,
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

export async function indexListItems(options: ListIndexOptions) {
  const { listId } = options;
  const { tags = [] } = options;

  const activeQueries = getActiveQueries(tags, options);

  return await prisma.listItem.findMany({
    where: {
      listId: 82,
    }
  })

}
class ListItemQueryBuilder {

}

class IndexQuery {
  baseQuery: Prisma.ListItemFindManyArgs = {
      select: {
        history: true
      },
      where: {
        AND: [],
      },

  }

  constructor(options: ListIndexOptions) {

  }

  /**
   *   if (activeQueries.out_with_provider) {
   *     itemsWhereOr = itemsWhereOr.concat(activeQueries.out_with_provider);
   *   }
   *
   *   if (activeQueries.live) {
   *     itemsWhereOr = itemsWhereOr.concat(activeQueries.live);
   *   }
   *
   *   if (activeQueries.to_do) {
   *     itemsWhereOr = itemsWhereOr.concat(activeQueries.to_do);
   *   }
   *
   *   baseQuer
   */


  withProvider() {}

  live() {

  }

  noActionNeeded() {

  }

  todo() {

  }


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
