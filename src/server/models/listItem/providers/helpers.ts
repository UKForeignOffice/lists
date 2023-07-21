import type { Address, CountryName, ListItem, Point } from "server/models/types";
import type { ServiceType } from "shared/types";
import pgescape from "pg-escape";
import { geoPointIsValid } from "server/models/helpers";
import { ROWS_PER_PAGE } from "server/models/listItem/pagination";
import { prisma } from "server/models/db/prisma-client";
import { get, startCase } from "lodash";
import { logger } from "server/services/logger";
import type { LanguageRow, LanguageRows, UpdatableAddressFields } from "server/models/listItem/providers/types";
import type { DeserialisedWebhookData, ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { countriesList, languages } from "server/services/metadata";
import { getObjectDiff } from "server/components/lists/controllers/ingest/helpers";

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
  const whereCountryName = pgescape(`AND lower("Country".name) = %L`, countryName.toLowerCase());

  let withDistance = "";
  let orderBy = `ORDER BY "ListItem"."jsonData"->>'organisationName' ASC`;

  if (geoPointIsValid(fromGeoPoint) && region !== undefined && region !== "" && region !== "Not set") {
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

export async function some(countryName: CountryName, serviceType: ServiceType): Promise<boolean> {
  try {
    const result = await prisma.listItem.findMany({
      where: {
        isApproved: true,
        isPublished: true,
        type: serviceType,
        list: {
          country: {
            name: {
              equals: countryName,
              mode: "insensitive",
            },
          },
        },
      },
      select: {
        id: true,
      },
      take: 1,
    });

    return result.length > 0;
  } catch (error: unknown) {
    const typedError = error as { message: string };
    logger.error(`countryHasAnyListItem Error: ${typedError.message}`);
    return false;
  }
}

export function getListItemContactInformation(listItem: ListItem): {
  contactName: string;
  contactEmailAddress: string;
  contactPhoneNumber: string;
} {
  const contactName = get(listItem?.jsonData, "contactName")!;
  const contactEmailAddress = get(listItem?.jsonData, "emailAddress")!;
  const contactPhoneNumber = get(listItem?.jsonData, "contactPhoneNumber") ?? get(listItem?.jsonData, "phoneNumber")!;
  return { contactName, contactEmailAddress, contactPhoneNumber };
}

export function getChangedAddressFields(
  webhook: DeserialisedWebhookData | ListItemJsonData,
  address: Partial<Address>
): Partial<UpdatableAddressFields> {
  const updatableAddressObject: UpdatableAddressFields = {
    firstLine: address?.firstLine,
    secondLine: address?.secondLine ?? undefined, // Casting to undefined when address?.secondLine nullish (i.e. null OR undefined) so a strict comparison `===` can be made.
    postCode: address?.postCode,
    city: address?.city,
  };

  const webhookAsAddress = {
    firstLine: webhook?.["address.firstLine"] ?? address?.firstLine,
    secondLine: webhook?.["address.secondLine"] ?? address?.secondLine ?? undefined,
    postCode: webhook?.postCode ?? address.postCode,
    city: webhook?.city ?? address.city,
  };

  return getObjectDiff(updatableAddressObject, webhookAsAddress);
}

export function getLanguagesRows(languagesProvided: string[]): LanguageRows {
  if (!languagesProvided) {
    const languageRows: LanguageRows = { rows: [] };
    return languageRows;
  }

  const rows: LanguageRow[] = languagesProvided.map((language: string) => {
    // @ts-ignore
    const languageName: string = languages[language];

    const languageRow: LanguageRow = {
      key: {
        text: language,
        classes: "govuk-summary-list__row--hidden-titles",
      },
      value: {
        text: languageName,
        classes: "govuk-summary-list__key--hidden-titles",
      },
      actions: {
        items: [
          {
            href: `?remove=${language}`,
            text: "Remove",
            visuallyHiddenText: language,
            classes: "govuk-link--no-visited-state",
          },
        ],
      },
    };
    return languageRow;
  });

  return { rows };
}

export function validateCountry(countryName: string | string[]): string | undefined {
  const countryAsString = Array.isArray(countryName) ? countryName[0] : countryName;
  const matchingCountryName = countriesList.find((country) => country.value === countryAsString)?.value;
  if (!matchingCountryName) logger.error(`validateCountry: Invalid country ${countryName} detected`);
  return matchingCountryName;
}

export function validateCountryLower(countryName: string | string[] = ""): string | undefined {
  const countryAsString = Array.isArray(countryName) ? countryName[0] : countryName;

  const matchingCountryName = countriesList.find(
    (country) => country.value.toLowerCase() === countryAsString.toLowerCase()
  )?.value;
  if (!matchingCountryName) logger.error(`Invalid country ${countryName} detected`);
  return matchingCountryName;
}
