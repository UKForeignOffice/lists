import { WebhookData } from "server/components/formRunner";
import {
  EventJsonData,
  List,
  Point,
  ServiceType,
  User,
  ListItem,
} from "server/models/types";
import {
  ListItemWithAddressCountry,
  ListItemWithJsonData,
} from "server/models/listItem/providers/types";
import { makeAddressGeoLocationString } from "server/models/listItem/geoHelpers";
import { rawUpdateGeoLocation } from "server/models/helpers";
import { geoLocatePlaceByText } from "server/services/location";
import { recordListItemEvent } from "server/models/audit";
import { getChangedAddressFields } from "server/models/listItem/providers/helpers";
import { listItemCreateInputFromWebhook } from "./listItemCreateInputFromWebhook";
import pgescape from "pg-escape";
import { prisma } from "../db/prisma-client";
import { logger } from "server/services/logger";
import {
  AuditEvent,
  ListItemEvent,
  Prisma,
  Status,
  ListItem as PrismaListItem,
} from "@prisma/client";
import { recordEvent } from "./listItemEvent";
import { merge } from "lodash";
import { DeserialisedWebhookData } from "./providers/deserialisers/types";

export const createFromWebhook = listItemCreateInputFromWebhook;

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
      INNER JOIN "Audit" ON "ListItem"."id" = "Audit".id

      ${pgescape(`WHERE "ListItem"."type" = %L`, list.type)}
      AND ("ListItem"."jsonData"->'metadata'->>'emailVerified')::boolean
      AND "Country".id = ${list.countryId}

      ORDER BY "ListItem"."createdAt" DESC`);
  } catch (error) {
    logger.error(`approveLawyer Error ${error.message}`);
    throw new Error("Failed to approve lawyer");
  }
}

export async function findListItemById(id: string | number): Promise<any> {
  try {
    const returnVal = await prisma.listItem.findUnique({
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
        history: true,
        pinnedBy: true,
      },
    });
    return returnVal;
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
      recordListItemEvent(
        {
          eventName: isApproved ? "approve" : "disapprove",
          itemId: id,
          userId,
        },
        AuditEvent.UNPUBLISHED
      ),
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
  const status = isPublished ? Status.PUBLISHED : Status.UNPUBLISHED;
  const auditEvent = isPublished
    ? AuditEvent.PUBLISHED
    : AuditEvent.UNPUBLISHED;

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: { id },
        data: {
          isApproved: true,
          isPublished,
          status,
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
      recordEvent(
        {
          eventName: isPublished ? "publish" : "unpublish",
          userId,
          itemId: id,
        },
        id,
        isPublished ? ListItemEvent.PUBLISHED : ListItemEvent.UNPUBLISHED
      ),
    ]);

    return listItem;
  } catch (error) {
    logger.error(`publishLawyer Error ${error.message}`);

    throw new Error("Failed to publish lawyer");
  }
}

export async function persistListItemChanges(
  id: number,
  userId: User["id"]
): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("persistListItemChanges Error: userId is undefined");
  }
  const auditEvent = AuditEvent.PUBLISHED;
  const listItemEvent = ListItemEvent.PUBLISHED;

  try {
    const listItem = await prisma.listItem.findUnique({
      where: { id },
      include: {
        history: true,
      },
    });

    const editEvent = listItem?.history
      .sort((a, b) => b.time.getMilliseconds() - a.time.getMilliseconds())
      .filter((audit) => audit.type === "EDITED")
      .pop();

    const eventJsonData: EventJsonData = editEvent?.jsonData as EventJsonData;

    const [updatedListItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: {
          id,
        },
        data: {
          isApproved: true,
          isPublished: true,
          jsonData: eventJsonData?.updatedJsonData,
        },
      }),
      recordListItemEvent(
        {
          eventName: "publish",
          itemId: id,
          userId,
        },
        auditEvent
      ),

      recordEvent(
        {
          eventName: "publish",
          itemId: id,
          userId,
        },
        id,
        listItemEvent
      ),
    ]);

    return updatedListItem;
  } catch (e) {
    logger.error(`persistListItemChanges Error ${e.message}`);

    throw new Error("Failed to persist updates to list item");
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

    // TODO: Make updatedJsonData without casting
    await prisma.listItem.update({
      where: { reference },
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

export async function createListItem(
  webhookData: WebhookData
): Promise<ListItemWithAddressCountry> {
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

    await recordEvent(
      {
        eventName: "edit",
        itemId: listItem.id,
      },
      listItem.id,
      ListItemEvent.NEW
    );

    return listItem;
  } catch (error) {
    logger.error(`create ListItem failed ${error.message}`);
    throw error;
  }
}

type Nullable<T> = T | undefined | null;

// TODO:- check with Ali
export async function update(
  id: ListItem["id"],
  userId: User["id"],
  data: DeserialisedWebhookData
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
      isApproved: true,
      isPublished: true,
      status: Status.PUBLISHED,
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
        recordListItemEvent(
          {
            eventName: "publish",
            itemId: id,
            userId,
            // @ts-ignore
            updatedJsonData,
          },
          AuditEvent.PUBLISHED
        ),
        recordEvent(
          {
            eventName: "publish",
            itemId: id,
            userId,
          },
          id,
          ListItemEvent.PUBLISHED
        ),
      ]);
    } else {
      result = await prisma.$transaction([
        prisma.listItem.update(listItemPrismaQuery),
        recordListItemEvent(
          {
            eventName: "publish",
            itemId: id,
            userId,
            // @ts-ignore
            updatedJsonData,
          },
          AuditEvent.PUBLISHED
        ),
        recordEvent(
          {
            eventName: "publish",
            itemId: id,
            userId,
          },
          id,
          ListItemEvent.PUBLISHED
        ),
      ]);
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

export async function deleteListItem(
  id: number,
  userId: User["id"]
): Promise<void> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }
  // const auditEvent = AuditEvent.DELETED;

  try {
    await prisma.$transaction([
      prisma.event.deleteMany({
        where: {
          listItemId: id,
        },
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
