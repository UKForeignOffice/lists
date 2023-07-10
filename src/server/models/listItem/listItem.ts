import { makeAddressGeoLocationString } from "server/models/listItem/geoHelpers";
import { rawUpdateGeoLocation } from "server/models/helpers";
import { geoLocatePlaceByText } from "server/services/location";
import { getChangedAddressFields } from "server/models/listItem/providers/helpers";
import { listItemCreateInputFromWebhook } from "./listItemCreateInputFromWebhook";
import pgescape from "pg-escape";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { Status } from "@prisma/client";
import { merge } from "lodash";
import { EVENTS } from "./listItemEvent";
import { subMonths } from "date-fns";

import type { WebhookData } from "server/components/formRunner";
import type { List, ListItem, Point, User } from "server/models/types";
import type { ServiceType } from "shared/types";
import type {
  ListItemWithAddressCountry,
  ListItemWithAddressCountryAndList,
  ListItemWithJsonData,
} from "server/models/listItem/providers/types";
import type { ListItem as PrismaListItem, Prisma } from "@prisma/client";
import type { DeserialisedWebhookData, ListItemJsonData } from "./providers/deserialisers/types";

export { findIndexListItems } from "./summary";
export const createFromWebhook = listItemCreateInputFromWebhook;

export async function findListItemsForList(list: List): Promise<ListItem[]> {
  try {
    /**
     * TODO:- should this be using prisma.listItem.findMany(..)?
     */
    return await prisma.$queryRaw(
      `SELECT
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
      INNER JOIN "Audit" ON "ListItem"."id" = "Audit".id

      ${pgescape(`WHERE "ListItem"."type" = %L`, list.type)}
      AND ("ListItem"."jsonData"->'metadata'->>'emailVerified')::boolean
      AND "Country".id = ${list.countryId}

      ORDER BY "ListItem"."createdAt" DESC` as unknown as TemplateStringsArray
    );
  } catch (error) {
    logger.error(`approveLawyer Error ${(error as Error).message}`);
    throw new Error("Failed to approve lawyer");
  }
}

export async function findListItemById(id: string | number) {
  try {
    return await prisma.listItem.findUnique({
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
        history: {
          orderBy: {
            time: "desc",
          },
        },
        pinnedBy: true,
      },
    });
  } catch (error) {
    logger.error(`findListItemById Error ${error.message}`);
    throw new Error(`failed to find ${id}`);
  }
}

export async function findListItems(options: {
  listIds?: number[];
  listItemIds?: number[];
  statuses?: Status[];
  isAnnualReview?: boolean;
}) {
  try {
    const { listIds, listItemIds, statuses, isAnnualReview } = options;
    if (!listIds?.length && !listItemIds?.length) {
      const message = "List ids or list item ids must be specified to find list items";
      logger.error(message);
      return { error: Error(message) };
    }
    const result = await prisma.listItem.findMany({
      where: {
        ...(listIds != null && { listId: { in: listIds } }),
        ...(listItemIds != null && { id: { in: listItemIds } }),
        ...(statuses != null && { status: { in: statuses } }),
        ...(isAnnualReview != null && { isAnnualReview }),
        history: {
          some: {
            type: "PUBLISHED",
            time: {
              lte: subMonths(Date.now(), 1),
            },
          },
        },
      },
      include: {
        history: {
          orderBy: {
            time: "desc",
          },
        },
      },
    });
    return { result };
  } catch (error) {
    logger.error(`findListItemsForLists Error ${(error as Error).stack}`);
    return { error: Error("Unable to get list items") };
  }
}

export async function findListItemByReference(ref: string) {
  try {
    return await prisma.listItem.findUnique({
      where: { reference: ref },
      include: {
        list: {
          select: {
            type: true,
            jsonData: true,
          },
        },
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
    });
  } catch (error) {
    throw new Error(`findListItemByReference Error ${(error as Error).message}`);
  }
}

/**
 * deceptive method... toggle[r]ListItemIsPublished assumedly should toggle (i.e. invert the current isPublished status).
 */
export async function togglerListItemIsPublished({
  id,
  isPublished,
  jsonData,
  userId,
}: {
  id: number;
  isPublished: boolean;
  jsonData: ListItemJsonData;
  userId: User["id"];
}): Promise<ListItemWithAddressCountry> {
  if (userId === undefined) {
    throw new Error("togglerListItemIsPublished Error: userId is undefined");
  }
  const status = isPublished ? Status.PUBLISHED : Status.UNPUBLISHED;
  const event = EVENTS[status](userId);
  logger.info(`user ${userId} is setting ${id} isPublished to ${isPublished}`);
  if (jsonData.updatedJsonData) {
    delete jsonData.updatedJsonData;
  }
  try {
    const listItem = await prisma.listItem.update({
      where: { id },
      data: {
        isApproved: true,
        isPublished,
        status,
        jsonData,
        history: {
          create: [event],
        },
      },
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });

    return listItem;
  } catch (error) {
    logger.error(`publishLawyer Error ${error.message}`);

    throw new Error("Failed to publish lawyer");
  }
}

interface SetEmailIsVerified {
  type?: ServiceType;
  listId?: number;
}

export async function setEmailIsVerified({ reference }: { reference: string }): Promise<SetEmailIsVerified> {
  try {
    const item = await prisma.listItem.findUnique({
      where: { reference },
    });

    if (item === null) {
      return {};
    }

    // TODO: Can we use Prisma enums to correctly type the item type in order to avoid typecasting further on?
    const { type, jsonData, listId } = item as ListItemWithJsonData;
    const { metadata } = jsonData;
    const serviceType = type as ServiceType;

    if (metadata?.emailVerified === true) {
      return {
        ...metadata,
        type: serviceType,
      };
    }

    const updatedJsonData = {
      ...jsonData,
      metadata: { ...metadata, emailVerified: true },
    };

    await prisma.listItem.update({
      where: { reference },
      // @ts-ignore
      data: { jsonData: updatedJsonData as PrismaListItem["jsonData"] },
    });

    return {
      type: serviceType,
      listId,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function createListItem(webhookData: WebhookData): Promise<ListItemWithAddressCountryAndList> {
  try {
    const data = await listItemCreateInputFromWebhook(webhookData);

    const listItem = await prisma.listItem.create({
      data,
      include: {
        list: {
          select: {
            jsonData: true,
            country: true,
            type: true,
          },
        },
        address: {
          include: {
            country: true,
          },
        },
      },
    });

    return listItem;
  } catch (error) {
    logger.error(`create ListItem failed ${error.message}`);
    throw error;
  }
}

type Nullable<T> = T | undefined | null;

/**
 * updates and PUBLISHES!
 */
export async function update(id: ListItem["id"], userId: User["id"], legacyDataParameter?: DeserialisedWebhookData) {
  const updateLogger = logger.child({ listItemId: id, user: userId, method: "ListItem.update" });
  updateLogger.info(`user ${userId} is attempting to update ${id}`);

  if (legacyDataParameter) {
    updateLogger.info(
      "legacy data parameter used. updating with legacy data parameter however ListItem.jsonData.updatedJsonData should be used"
    );
  }
  const listItemResult = await prisma.listItem
    .findFirst({
      where: { id },
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    })
    .catch((e) => {
      throw Error(`list item ${id} not found - ${e}`);
    });

  const { address: currentAddress, ...listItem } = listItemResult!;

  const jsonData = listItemResult?.jsonData as Prisma.JsonObject;
  // @ts-ignore
  const data: DeserialisedWebhookData | null | undefined = legacyDataParameter ?? jsonData?.updatedJsonData;

  if (!data) {
    updateLogger.info(
      "Cannot resolve any data to update the list item with jsonData.updatedJsonData and data parameter were empty"
    );
  }
  const areasOfLaw = data?.areasOfLaw;
  const repatriationServicesProvided = data?.repatriationServicesProvided;
  const localServicesProvided = data?.localServicesProvided;

  const updatedJsonData = merge(listItem.jsonData, data) as ListItemJsonData;

  // @todo this will need restructuring to accommodate array field types for other providers
  if (areasOfLaw) {
    updatedJsonData.areasOfLaw = areasOfLaw;
  }
  if (repatriationServicesProvided) {
    updatedJsonData.repatriationServicesProvided = repatriationServicesProvided;
  }
  if (localServicesProvided) {
    updatedJsonData.localServicesProvided = localServicesProvided;
  }

  let geoLocationParams: Nullable<[number, Point]>;

  const addressUpdates = getChangedAddressFields(data!, currentAddress ?? {});
  const requiresAddressUpdate = Object.keys(addressUpdates).length > 0;

  if (requiresAddressUpdate && data) {
    try {
      // @ts-ignore
      const address = makeAddressGeoLocationString(updatedJsonData);
      const point = await geoLocatePlaceByText(address, currentAddress.country.name);

      geoLocationParams = [currentAddress.geoLocationId!, point];
    } catch (e) {
      updateLogger.error(e);
      throw Error("GeoLocation update failed");
    }
  }

  delete updatedJsonData.updatedJsonData;

  const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
    where: { id },
    data: {
      jsonData: updatedJsonData,
      isApproved: true,
      isPublished: true,
      isAnnualReview: false,
      status: Status.PUBLISHED,
      history: {
        create: EVENTS.PUBLISHED(userId),
      },
      ...(requiresAddressUpdate && {
        address: {
          update: {
            ...addressUpdates,
          },
        },
      }),
    },
    include: {
      address: {
        include: {
          country: true,
        },
      },
    },
  };

  try {
    let result;

    const updateItem = prisma.listItem.update(listItemPrismaQuery);

    if (requiresAddressUpdate) {
      // @ts-ignore
      result = await prisma.$transaction([updateItem, rawUpdateGeoLocation(...geoLocationParams!)]);
    } else {
      result = await updateItem;
    }

    if (!result) {
      throw Error("listItem.update prisma update failed");
    }

    return result;
  } catch (err) {
    updateLogger.error(`listItem.update transactional error - rolling back ${err.message}`);
    throw err;
  }
}

export async function deleteListItem(id: number, userId: User["id"]): Promise<void> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }
  try {
    await prisma.$transaction([
      prisma.event.create({
        data: EVENTS.DELETED(userId, id),
      }),
      prisma.listItem.delete({
        where: {
          id,
        },
      }),
    ]);
  } catch (e) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error("Failed to delete item");
  }
}

export async function archiveListItem(id: number, userId: User["id"], reason: string): Promise<void> {
  await prisma.listItem.update({
    where: { id: Number(id) },
    data: {
      status: Status.UNPUBLISHED,
      history: {
        create: EVENTS.ARCHIVED(userId, reason),
      },
    },
  });
}
