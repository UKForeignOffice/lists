import { IndexListItem, ListIndexOptions } from "server/models/listItem/types";
import { PaginationResults } from "server/components/lists";
import { calculatePagination, queryToPrismaQueryMap } from "server/models/listItem/queryFactory";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { getPaginationValues } from "server/models/listItem/pagination";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { getActivityStatus, getPublishingStatus, ListItemWithHistory } from "server/models/listItem/summary.helpers";

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
  if (!options.userId) {
    return [];
  }
  const result = await prisma.user.findUnique({
    where: {
      id: options.userId,
    },
    select: {
      pinnedItems: {
        include: {
          history: {
            orderBy: {
              time: "desc",
            },
          },
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
        id: userId,
      },
    },
  };
}

const emailIsVerified = { jsonData: { path: ["metadata", "emailVerified"], equals: true } };

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

  const OR = reqQueries.map((tag) => queryToPrismaQueryMap[tag]).filter(Boolean);

  const result = await prisma.listItem.findMany({
    where: {
      listId,
      AND: {
        ...emailIsVerified,
        ...notPinnedByUser(options.userId!),
        ...(!reqQueries.includes("archived") && { NOT: queryToPrismaQueryMap.archived }),
      },
      ...(OR.length && { OR }),
    },
    include: {
      history: {
        orderBy: {
          time: "desc",
        },
      },
      pinnedBy: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

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

  const pinnedItems = (await findPinnedIndexListItems(options)) ?? [];

  return {
    pinnedItems: pinnedItems?.map?.(listItemsWithIndexDetails),
    items: result.map(listItemsWithIndexDetails),
    ...pagination,
  };
}
