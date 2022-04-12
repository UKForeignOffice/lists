import { get, merge } from "lodash";
import pgescape from "pg-escape";
import { prisma } from "./../db/prisma-client";
import { logger } from "server/services/logger";
import {
  LawyersFormWebhookData,
  CovidTestSupplierFormWebhookData,
  WebhookData,
} from "server/components/formRunner";
import {
  List,
  User,
  ServiceType,
  ListItemGetObject,
  Point,
  LawyerListItemJsonData,
} from "./../types";
import { recordListItemEvent } from "./../audit";
import { CovidTestSupplierListItem, LawyerListItem } from "./providers";
import { ListItemWithAddressCountry } from "./providers/types";
import { Prisma, ListItem, ListItemEvent } from "@prisma/client";
import { makeAddressGeoLocationString } from "server/models/listItem/geoHelpers";
import { getChangedAddressFields } from "./providers/helpers";
import { geoLocatePlaceByText } from "server/services/location";
import { rawUpdateGeoLocation } from "server/models/helpers";
import { format } from "date-fns";
import { PaginationResults } from "server/components/lists";
import { getPaginationValues } from "server/models/listItem/pagination";
import { IndexListItem, ListIndexOptions, Tags, TAGS } from "./types";
import {
  calculatePagination,
  indexQueryBuilder,
  tagQueryFactory,
} from "server/models/listItem/queryFactory";

function listItemsWithIndexDetails(item: ListItem): IndexListItem {
  const { jsonData, createdAt, updatedAt, id } = item;
  const {
    organisationName,
    contactName,
    publishers,
    validators,
    administrators,
  } = jsonData as LawyerListItemJsonData;
  return {
    createdAt: format(createdAt, "dd MMMM yyyy"),
    updatedAt: format(updatedAt, "dd MMMM yyyy"),
    organisationName,
    contactName,
    publishers,
    validators,
    administrators,
    id,
  };
}

type IndexOptions = {
  page?: number;
  tags?: string | string[];
};

const newTags = {
  history: {
    every: {
      type: {
        not: ListItemEvent.NEW,
      },
    },
  },
};

type pinnedItemsOptions = {
  listId?: List["id"];
};

const prismaQuery = (listId, options) => {
  const currentPage = options?.pagination?.true ?? 1;
  const skipIndex = currentPage ? currentPage - 1 : currentPage;
  const listWhere = {
    id: listId,
  };
  const itemsWhere = {};

  const select = {};
  const q = {
    where: {
      id: listId,
    },
    select: {
      type: true,
      country: true,
      items: {
        where: {
          isPublished: true,
          listItemPinnedBy: {
            some: {
              id: 34,
            },
          },
        },
        skip: skipIndex * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      },
      _count: true,
    },
  };
};

const ITEMS_PER_PAGE = 20;
export async function findIndexListItems(options: ListIndexOptions): Promise<
  {
    type: List["type"];
    country: List["country"];
    items: IndexListItem[];
  } & PaginationResults
> {
  const { listId } = options;
  const { tags = [] } = options;
  const tagsAsArray = Array.isArray(tags) ? tags : [tags];
  const { take, skip } = calculatePagination(options);

  const activeQueries: {
    [prop in keyof Partial<Tags>]: Prisma.ListItemWhereInput;
  } = tagsAsArray.reduce((prev, tag) => {
    return {
      ...prev,
      [tag]: tagQueryFactory[tag](options),
    };
  }, {});

  const c = {
    where: {
      id: options.listId,
    },
    select: {
      type: true,
      country: true,
      items: {
        take,
        skip,
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  };
  if (tagsAsArray.length) {
  }
  if (activeQueries.out_with_provider) {
    c.select.items = {
      ...activeQueries.out_with_provider,
      ...c.select.items,
    };
  }

  const result = await prisma.list.findUnique();

  if (!result) {
    logger.error(`Failed to find ${listId}`);
    throw new Error(`Failed to find ${listId}`);
  }
  const { type, country, items, _count } = result;
  const pagination = await getPaginationValues({
    count: _count?.items ?? 0,
    rows: 20,
    route: "",
    page: options?.pagination?.page ?? 1,
    listRequestParams: {},
  });

  return {
    type,
    country,
    items: items.map(listItemsWithIndexDetails),
    ...pagination,
  };
}

export async function findListItemsForList(list: List): Promise<ListItem[]> {
  try {
    /**
     * TODO:- should this be using prisma.listItem.findMany(..)?
     */
    return await prisma.$queryRaw(`SELECT
        "ListItem".*,
        (
          SELECT ROW_TO_JSON(a)
          FROM (
            SELECT
              "Address"."firstLine",
              "Address"."secondLine",
              "Address"."city",
              "Address"."postCode",
              (
                SELECT ROW_TO_JSON(c)
                FROM (
                  SELECT name
                  FROM "Country"
                  WHERE "Address"."countryId" = "Country"."id"
                ) as c
              ) as country
              FROM "Address"
              WHERE "Address".id = "ListItem"."addressId"
          ) as a
        ) as address,

        ST_X("GeoLocation"."location"::geometry) AS lat,
        ST_Y("GeoLocation"."location"::geometry) AS long

      FROM "ListItem"

      INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
      INNER JOIN "List" ON "ListItem"."listId" = "List".id
      INNER JOIN "Country" ON "List"."countryId" = "Country".id
      INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id

      ${pgescape(`WHERE "ListItem"."type" = %L`, list.type)}
      AND ("ListItem"."jsonData"->'metadata'->>'emailVerified')::boolean
      AND "Country".id = ${list.countryId}

      ORDER BY "ListItem"."createdAt" DESC`);
  } catch (error) {
    logger.error(`approveLawyer Error ${error.message}`);
    throw new Error("Failed to approve lawyer");
  }
}

export async function findListItemById(
  id: string | number
): Promise<ListItemGetObject> {
  try {
    return (await prisma.listItem.findUnique({
      where: { id: Number(id) },
      include: {
        address: {
          select: {
            id: true,
            firstLine: true,
            secondLine: true,
            city: true,
            postCode: true,
            country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })) as ListItemGetObject;
  } catch (error) {
    logger.error(`findListItemById Error ${error.message}`);
    throw new Error("Failed to approve lawyer");
  }
}

export async function togglerListItemIsApproved({
  id,
  isApproved,
  userId,
}: {
  id: number;
  isApproved: boolean;
  userId: User["id"];
}): Promise<ListItem> {
  const data: {
    isApproved: boolean;
    isPublished?: boolean;
  } = { isApproved };

  if (userId === undefined) {
    throw new Error("togglerListItemIsApproved Error: userId is undefined");
  }

  if (!isApproved) {
    data.isPublished = false;
  }

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: { id },
        data,
      }),
      recordListItemEvent({
        eventName: isApproved ? "approve" : "disapprove",
        itemId: id,
        userId,
      }),
    ]);
    return listItem;
  } catch (error) {
    logger.error(`togglerListItemIsApproved Error ${error.message}`);
    throw error;
  }
}

export async function togglerListItemIsPublished({
  id,
  isPublished,
  userId,
}: {
  id: number;
  isPublished: boolean;
  userId: User["id"];
}): Promise<ListItemWithAddressCountry> {
  if (userId === undefined) {
    throw new Error("togglerListItemIsPublished Error: userId is undefined");
  }

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: { id },
        data: { isPublished },
        include: {
          address: {
            include: {
              country: true,
            },
          },
        },
      }),
      recordListItemEvent({
        eventName: isPublished ? "publish" : "unpublish",
        itemId: id,
        userId,
      }),
    ]);

    return listItem;
  } catch (error) {
    logger.error(`publishLawyer Error ${error.message}`);

    throw new Error("Failed to publish lawyer");
  }
}

export async function deleteListItem(
  id: number,
  userId: User["id"]
): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.delete({
        where: {
          id,
        },
      }),
      recordListItemEvent({
        eventName: "delete",
        itemId: id,
        userId,
      }),
    ]);

    return listItem;
  } catch (e) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error("Failed to delete item");
  }
}

interface SetEmailIsVerified {
  type?: ServiceType;
}

export async function setEmailIsVerified({
  reference,
}: {
  reference: string;
}): Promise<SetEmailIsVerified> {
  try {
    const item = await prisma.listItem.findUnique({
      where: { reference },
    });

    if (item === null) {
      return {};
    }

    // TODO: Can we use Prisma enums to correctly type the item type in order to avoid typecasting further on?
    const { type } = item;
    const serviceType = type as ServiceType;

    if (get(item, "jsonData.metadata.emailVerified") === true) {
      return {
        type: serviceType,
      };
    }

    const jsonData = merge(item.jsonData, {
      metadata: { emailVerified: true },
    });

    await prisma.listItem.update({
      where: { reference },
      data: { jsonData },
    });

    return {
      type: serviceType,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function createListItem(
  serviceType: ServiceType,
  webhookData: WebhookData
): Promise<ListItemWithAddressCountry> {
  switch (serviceType) {
    case ServiceType.lawyers:
      return await LawyerListItem.create(webhookData as LawyersFormWebhookData);
    case ServiceType.covidTestProviders:
      return await CovidTestSupplierListItem.create(
        webhookData as CovidTestSupplierFormWebhookData
      );
  }
}

type Nullable<T> = T | undefined | null;

export async function update(
  id: ListItem["id"],
  data: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<void> {
  const listItemResult = await prisma.listItem
    .findFirst({
      where: { id },
      include: {
        address: true,
      },
    })
    .catch((e) => {
      throw Error(`list item ${id} not found - ${e}`);
    });

  const { address: currentAddress, ...listItem } = listItemResult!;
  const addressUpdates = getChangedAddressFields(data, currentAddress ?? {});
  const requiresAddressUpdate = Object.keys(addressUpdates).length > 0;
  const updatedJsonData = merge(listItem.jsonData, data);

  const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
    where: { id },
    data: {
      jsonData: updatedJsonData,
    },
  };

  let addressPrismaQuery: Nullable<Prisma.AddressUpdateArgs>;
  let geoLocationParams: Nullable<[number, Point]>;

  if (requiresAddressUpdate) {
    try {
      const address = makeAddressGeoLocationString(data);
      const point = await geoLocatePlaceByText(address);

      addressPrismaQuery = {
        where: {
          id: currentAddress.id,
        },
        data: addressUpdates,
      };
      geoLocationParams = [currentAddress.geoLocationId!, point];
    } catch (e) {
      throw Error("GeoLocation update failed");
    }
  }

  try {
    let result;
    if (requiresAddressUpdate) {
      result = await prisma.$transaction([
        prisma.listItem.update(listItemPrismaQuery),
        prisma.address.update(addressPrismaQuery!),
        rawUpdateGeoLocation(...geoLocationParams!),
      ]);
    } else {
      result = await prisma.listItem.update(listItemPrismaQuery);
    }

    if (!result) {
      throw Error("listItem.update prisma update failed");
    }
  } catch (err) {
    logger.error(
      `listItem.update transactional error - rolling back ${err.message}`
    );
    throw err;
  }
}
