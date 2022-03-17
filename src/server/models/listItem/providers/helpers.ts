import {
  Address,
  CountryName,
  ListItem,
  Point,
  ServiceType,
} from "server/models/types";
import pgescape from "pg-escape";
import { geoPointIsValid } from "server/models/helpers";
import { ROWS_PER_PAGE } from "server/models/listItem";
import { prisma } from "server/models/db/prisma-client";
import { get, startCase, toLower } from "lodash";
import { logger } from "server/services/logger";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/components/formRunner";
import { UpdatableAddressFields } from "server/models/listItem/providers/types";

/**
 * Constructs SQL for querying published list items.  If the region is not populated
 * or is set to "Not set" then it will be ordered by company name otherwise by distance
 * from the geo point.
 * @param props
 */
export function fetchPublishedListItemQuery(props: {
  type: string;
  countryName: string;
  region?: string;
  fromGeoPoint?: Point;
  andWhere?: string;
  offset: number;
}): string {
  const { type, countryName, region, fromGeoPoint, andWhere, offset } = props;
  const whereType = pgescape(`WHERE "ListItem"."type" = %L`, type);
  const whereCountryName = pgescape(`AND "Country".name = %L`, countryName);

  let withDistance = "";
  let orderBy = `ORDER BY "ListItem"."jsonData"->>'organisationName' ASC`;

  if (
    geoPointIsValid(fromGeoPoint) &&
    region !== undefined &&
    region !== "" &&
    region !== "Not set"
  ) {
    withDistance = `,
    ST_Distance(
        "GeoLocation".location,
        ST_GeographyFromText('Point(${fromGeoPoint?.join(" ")})')
      ) AS distanceInMeters
    `;

    orderBy = "ORDER BY distanceInMeters ASC";
  }
  let limitOffset = "";
  if (ROWS_PER_PAGE >= 0 && offset >= 0) {
    limitOffset = `LIMIT ${ROWS_PER_PAGE} OFFSET ${offset}`;
  }

  return `
    SELECT
      "ListItem"."id",
 	    "ListItem"."reference",
 	    "ListItem"."type",
 	    "ListItem"."jsonData",
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
 	    ) as address${withDistance}

    FROM "ListItem"
 	  INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
 	  INNER JOIN "List" ON "ListItem"."listId" = "List".id
	  INNER JOIN "Country" ON "List"."countryId" = "Country".id
    INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
    ${whereType}
    ${whereCountryName}
    ${andWhere ?? ""}
    AND "ListItem"."isApproved" = true
    AND "ListItem"."isPublished" = true
    AND "ListItem"."isBlocked" = false
    ${orderBy}
    ${limitOffset}
  `;
}

export async function checkListItemExists({
  organisationName,
  locationName,
  countryName,
}: {
  organisationName: string;
  locationName?: string;
  countryName: string;
}): Promise<boolean> {
  const jsonDataQuery = [
    {
      jsonData: {
        path: ["organisationName"],
        equals: organisationName.toLocaleLowerCase(),
      },
    },
  ];

  if (locationName !== undefined && locationName !== null) {
    jsonDataQuery.push({
      jsonData: {
        path: ["locationName"],
        equals: locationName.toLocaleLowerCase(),
      },
    });
  }

  const total = await prisma.listItem.count({
    where: {
      AND: jsonDataQuery,
      address: {
        country: {
          name: startCase(countryName),
        },
      },
    },
  });

  return total > 0;
}

export async function some(
  countryName: CountryName,
  serviceType: ServiceType
): Promise<boolean> {
  try {
    const result = await prisma.listItem.findMany({
      where: {
        isApproved: true,
        isPublished: true,
        type: serviceType,
        address: {
          country: {
            name: startCase(toLower(countryName)),
          },
        },
      },
      select: {
        id: true,
      },
      take: 1,
    });

    return result.length > 0;
  } catch (error) {
    logger.error(`countryHasAnyListItem Error: ${error.message}`);
    return false;
  }
}

export function getListItemContactInformation(listItem: ListItem): {
  contactName: string;
  contactEmailAddress: string;
  contactPhoneNumber: string;
} {
  const contactName = get(listItem?.jsonData, "contactName");
  const contactEmailAddress =
    get(listItem?.jsonData, "contactEmailAddress") ??
    get(listItem?.jsonData, "emailAddress") ??
    get(listItem?.jsonData, "email");
  const contactPhoneNumber =
    get(listItem?.jsonData, "contactPhoneNumber") ??
    get(listItem?.jsonData, "phoneNumber");

  return { contactName, contactEmailAddress, contactPhoneNumber };
}

export function pickWebhookAddressAsAddress(
  webhook: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Partial<UpdatableAddressFields> {
  if ("organisationDetails" in webhook) {
    return {
      firstLine: webhook.organisationDetails?.addressLine1,
      secondLine: webhook.organisationDetails?.addressLine2,
      postCode: webhook.organisationDetails?.postcode,
      city: webhook.organisationDetails?.city,
    };
  }
  return {
    firstLine: webhook?.addressLine1,
    secondLine: webhook?.addressLine2,
    postCode: webhook?.postcode,
    city: webhook?.city,
  };
}
export function getChangedAddressFields(
  webhook: LawyersFormWebhookData | CovidTestSupplierFormWebhookData,
  address: Partial<Address>
): Partial<UpdatableAddressFields> {
  const updatableAddressObject: UpdatableAddressFields = {
    firstLine: address?.firstLine ?? "",
    secondLine: address?.secondLine ?? null, // TODO:- fix types.. this shouldn't need `?? null`.
    postCode: address?.postCode ?? "",
    city: address?.city ?? "",
  };

  const webhookAddress = pickWebhookAddressAsAddress(webhook);
  const updatableEntries = Object.entries(updatableAddressObject);

  return updatableEntries.reduce((prev, entry) => {
    const [key, value] = entry as [keyof UpdatableAddressFields, any];
    const valueHasChanged = webhookAddress[key] !== value;
    return {
      ...prev,
      ...(valueHasChanged && { [key]: value }),
    };
  }, {});
}
