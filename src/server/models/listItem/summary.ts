import {
  IndexListItem,
  ListIndexOptions,
  TAGS,
  Tags,
} from "server/models/listItem/types";
import { LawyerListItemJsonData, List } from "server/models/types";
import { PaginationResults } from "server/components/lists";
import {
  calculatePagination,
  tagQueryFactory,
} from "server/models/listItem/queryFactory";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { getPaginationValues } from "server/models/listItem/pagination";
import { ListItem, Prisma, Status } from "@prisma/client";
import { format } from "date-fns";

function listItemsWithIndexDetails(item: ListItem): IndexListItem {
  const { jsonData, createdAt, updatedAt, id, status } = item;
  const {
    organisationName,
    contactName,
    publishers,
    validators,
    administrators,
  } = jsonData as LawyerListItemJsonData;
  const isPublished = item.isPublished && TAGS.published;
  const isNew =
    (item.status === Status.NEW ||
      item.status === Status.EDITED ||
      item.status === Status.UNPUBLISHED) &&
    TAGS.to_do;
  const isOutWithProvider =
    item.status === Status.OUT_WITH_PROVIDER && TAGS.out_with_provider;
  return {
    createdAt: format(createdAt, "dd MMMM yyyy"),
    updatedAt: format(updatedAt, "dd MMMM yyyy"),
    organisationName,
    contactName,
    publishers,
    validators,
    administrators,
    id,
    status,
    tags: [isPublished, isNew, isOutWithProvider].filter(Boolean) as string[],
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
): { [prop in keyof Partial<Tags>]: Prisma.ListItemWhereInput } {
  return tags.reduce((prev, tag) => {
    return {
      ...prev,
      [tag]: tagQueryFactory[tag](options),
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
  const { tags = [] } = options;

  // TODO:- need to investigate bug to do with take/skip on related entries. Seems to pull all of them regardless!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paginationOptions: {} | { take: number; skip: number } =
    calculatePagination(options);

  const activeQueries = getActiveQueries(tags, options);

  const baseQuery = {
    where: {
      id: options.listId,
    },
    select: {
      type: true,
      country: true,
      items: {
        where: {},
      },
    },
  };
  let itemsWhereOr: Prisma.Enumerable<Prisma.ListItemWhereInput> = [];

  if (activeQueries.out_with_provider) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.out_with_provider as Prisma.ListItemWhereInput[]);
  }

  if (activeQueries.published) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.published as Prisma.ListItemWhereInput[]);
  }

  if (activeQueries.to_do) {
    itemsWhereOr = itemsWhereOr.concat(activeQueries.to_do as Prisma.ListItemWhereInput[]);
  }
  baseQuery.select.items = {
    where: {
      AND: [
        {
          pinnedBy: {
            none: {
              id: options.userId,
            },
          },
          jsonData: { path: ["metadata", "emailVerified"], equals: true },
        },
      ],
    },
  };

  if (itemsWhereOr.length > 0) {
    // @typescript-eslint/prefer-ts-expect-error
    const { AND } = baseQuery.select.items.where;

    baseQuery.select.items.where = {
      AND,
      OR: itemsWhereOr,
    };
  }
  const [pinned, result] = await prisma.$transaction([
    findPinnedIndexListItems(options),
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
    pinnedItems: (pinned?.pinnedItems ?? []).map(listItemsWithIndexDetails),
    items: items.map(listItemsWithIndexDetails),
    ...pagination,
  };
}
