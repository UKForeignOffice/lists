import { ActivityStatusViewModel, IndexListItem, ListIndexOptions } from "server/models/listItem/types";
import { PaginationResults } from "server/components/lists";
import { calculatePagination, queryToPrismaQueryMap } from "server/models/listItem/queryFactory";
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
    type: 'to_do',
    colour: 'red',
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

function hasBeenArchived(history: Event[]) {
  return history.find(event => event.type === "ARCHIVED")
}

function getPublishingStatus(item: ListItemWithHistory): PUBLISHING_STATUS {
  if(item.isPublished) {
    return PUBLISHING_STATUS.live
  }

  if(hasBeenArchived(item.history)) {
    return PUBLISHING_STATUS.archived;
  }

  if(hasBeenUnpublishedSincePublishing(item.history) || item.status === "UNPUBLISHED") {
      return PUBLISHING_STATUS.unpublished
  }

  return PUBLISHING_STATUS.new
}

function wasUnpublishedByUser(history: Event[]): boolean {
  const event = history.find(event => event.type === 'UNPUBLISHED')
  const jsonData = event?.jsonData as Prisma.JsonObject;
  return !!jsonData?.userId ?? false
}

function getActivityStatus(item: ListItemWithHistory): ActivityStatusViewModel {
  const { history, status, isPublished } = item;

  if(!isPublished) {
    if(wasUnpublishedByUser(history)) {
      return statusToActivityVM.UNPUBLISHED
    }
    if(status === "ANNUAL_REVIEW_OVERDUE") {
      return statusToActivityVM.ANNUAL_REVIEW_OVERDUE
    }
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
async function findPinnedIndexListItems(options: ListIndexOptions) {
  if(!options.userId) {
    return []
  }
  const result = await prisma.user.findUnique({
    where: {
      id: options.userId,
    },
    select: {
      pinnedItems: {
        include: {
          history: true
        },
        where: {
          listId: options.listId,
          ...emailIsVerified,
        },
      },
    },
  });

  return result?.pinnedItems;
}

function notPinnedByUser(userId: number): Prisma.ListItemWhereInput {
  return {
      pinnedBy: {
        none: {
          id: userId
        }
      }
  }
}

const emailIsVerified = { jsonData: { path: ["metadata", "emailVerified"], equals: true } }


export async function findIndexListItems(options: ListIndexOptions): Promise<
  {
    pinnedItems: IndexListItem[];
    items: IndexListItem[];
  } & PaginationResults
> {
  const { listId, activity = [], publishing = [] } = options;
  const reqQueries = [...activity, ...publishing];
  // TODO:- need to investigate bug to do with take/skip on related entries. Seems to pull all of them regardless!
  // note: we are applying take/skip on List (i.e. take 20 Lists) rather than take 20 Items
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paginationOptions: {} | { take: number; skip: number } = calculatePagination(options);

  const OR = reqQueries.map(tag => queryToPrismaQueryMap[tag]).filter(Boolean)

  const result = await prisma.listItem.findMany({
    where: {
      listId,
      AND: {
        ...emailIsVerified,
        ...notPinnedByUser(options.userId!),
      },
      ...(OR.length && { OR })
    },
    include: {
      history: {
        orderBy: {
          time: 'desc',
        }
      },
      pinnedBy: true,
    },
    orderBy: {
      updatedAt: "desc",
    }
  })

  if (!result) {
    logger.error(`Failed to find ${listId}`);
    throw new Error(`Failed to find ${listId}`);
  }

  const pagination = await getPaginationValues({
    count: result?.length ?? 0,
    rows: 20,
    route: "",
    page: options?.pagination?.page ?? 1,
    listRequestParams: options?.reqQuery,
  });

  const pinnedItems = await findPinnedIndexListItems(options) ?? [];

  return {
    pinnedItems: pinnedItems?.map?.(listItemsWithIndexDetails),
    items: result.map(listItemsWithIndexDetails),
    ...pagination
  };
}
