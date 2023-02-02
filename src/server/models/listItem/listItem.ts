import { WebhookData } from "server/components/formRunner";
import { AuditListItemEventName, List, ListItem, Point, ServiceType, User } from "server/models/types";
import { ListItemWithAddressCountry, ListItemWithJsonData } from "server/models/listItem/providers/types";
import { getCountryFromData, makeAddressGeoLocationString } from "server/models/listItem/geoHelpers";
import { rawUpdateGeoLocation } from "server/models/helpers";
import { geoLocatePlaceByText } from "server/services/location";
import { recordListItemEvent } from "server/models/audit";
import { getChangedAddressFields } from "server/models/listItem/providers/helpers";
import { listItemCreateInputFromWebhook } from "./listItemCreateInputFromWebhook";
import pgescape from "pg-escape";
import { prisma } from "../db/prisma-client";
import { logger } from "server/services/logger";
import { AuditEvent, ListItem as PrismaListItem, ListItemEvent, Prisma, Status } from "@prisma/client";
import { merge } from "lodash";
import { DeserialisedWebhookData, ListItemJsonData } from "./providers/deserialisers/types";
import { EVENTS } from "./listItemEvent";
import { ListItemWithHistory } from "server/components/dashboard/listsItems/types";
import { subMonths } from "date-fns";
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
    if ((!listIds || !listIds.length) && (!listItemIds || !listItemIds?.length)) {
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
    logger.error(`findListItemsForLists Error ${(error as Error).message}`);
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
  userId,
}: {
  id: number;
  isPublished: boolean;
  userId: User["id"];
}): Promise<ListItemWithAddressCountry> {
  if (userId === undefined) {
    throw new Error("togglerListItemIsPublished Error: userId is undefined");
  }
  const status = isPublished ? Status.PUBLISHED : Status.UNPUBLISHED;
  const event = EVENTS[status](userId);
  logger.info(`user ${userId} is setting ${id} isPublished to ${isPublished}`);
  const auditEvent = isPublished ? AuditEvent.PUBLISHED : AuditEvent.UNPUBLISHED;

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: { id },
        data: {
          isApproved: true,
          isPublished,
          status,
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
      }),
      recordListItemEvent(
        {
          eventName: isPublished ? "publish" : "unpublish",
          itemId: id,
          userId,
        },
        auditEvent
      ),
    ]);

    return listItem;
  } catch (error) {
    logger.error(`publishLawyer Error ${error.message}`);

    throw new Error("Failed to publish lawyer");
  }
}

interface SetEmailIsVerified {
  type?: ServiceType;
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
    const { type, jsonData } = item as ListItemWithJsonData;
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
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function createListItem(webhookData: WebhookData): Promise<ListItemWithAddressCountry> {
  try {
    const data = await listItemCreateInputFromWebhook(webhookData);

    const listItem = await prisma.listItem.create({
      data,
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });
    await recordListItemEvent(
      {
        eventName: "edit",
        itemId: listItem.id,
      },
      AuditEvent.NEW
    );
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

  const jsonData = listItemResult?.jsonData as Prisma.JsonObject;
  // @ts-ignore
  const data: DeserialisedWebhookData | null | undefined = legacyDataParameter ?? jsonData?.updatedJsonData;

  if (!data) {
    updateLogger.info(
      "Cannot resolve any data to update the list item with jsonData.updatedJsonData and data parameter were empty"
    );
  }

  const { address: currentAddress, ...listItem } = listItemResult!;
  const addressUpdates = getChangedAddressFields(data!, currentAddress ?? {});
  const requiresAddressUpdate = Object.keys(addressUpdates).length > 0;
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

  if (requiresAddressUpdate && data) {
    try {
      const address = makeAddressGeoLocationString(data);
      const country = getCountryFromData(data);
      const point = await geoLocatePlaceByText(address, country);

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
    const updateAudit = recordListItemEvent(
      {
        eventName: "publish",
        itemId: id,
        userId,
        updatedJsonData,
      },
      AuditEvent.PUBLISHED
    );

    if (requiresAddressUpdate) {
      result = await prisma.$transaction([updateItem, rawUpdateGeoLocation(...geoLocationParams!), updateAudit]);
    } else {
      result = await prisma.$transaction([updateItem, updateAudit]);
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

/**
 * Updates the isAnnualReview flag for list items and adds a ListItemEvent record.
 * @param listItems
 * @param status
 * @param eventName
 * @param auditEvent
 */
export async function updateIsAnnualReview(
  list: List,
  listItems: ListItemWithHistory[],
  listItemEvent: ListItemEvent,
  eventName: AuditListItemEventName,
  auditEvent: AuditEvent
): Promise<Result<ListItemWithHistory[]>> {
  const updatedListItems: ListItemWithHistory[] = [];

  if (!listItems) {
    const message = `List item ids must be provided to update list items for list ${list.id}`;
    logger.error(message);
    return { error: new Error(message) };
  }
  for (const listItem of listItems) {
    const updateListItemPrismaStatement: Prisma.ListItemUpdateArgs = {
      where: {
        id: listItem.id,
      },
      data: {
        isAnnualReview: listItem.status !== Status.UNPUBLISHED,
        status: Status.OUT_WITH_PROVIDER,
        // history: EVENTS[listItemEvent](),
        history: {
          create: {
            type: listItemEvent,
            jsonData: {
              eventName: eventName,
              itemId: listItem.id,
            },
          },
        },
      },
    };
    try {
      logger.debug(`updating isAnnualReview for list item ${listItem.id}`);
      await prisma.listItem.update(updateListItemPrismaStatement);
      updatedListItems.push(listItem);
    } catch (err) {
      const message = `could not update list item ${listItem.id} due to ${err.message}.`;
      logger.error(message);
    }
  }
  return { result: updatedListItems };
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
      recordListItemEvent(
        {
          eventName: "delete",
          itemId: id,
          userId,
        },
        AuditEvent.DELETED
      ),
    ]);
  } catch (e) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error("Failed to delete item");
  }
}
