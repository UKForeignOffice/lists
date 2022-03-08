import { get, uniq, trim, merge, toLower, compact, startCase } from "lodash";
import pgescape from "pg-escape";
import { prisma } from "./../db/prisma-client";
import { logger } from "server/services/logger";
import { geoLocatePlaceByText } from "server/services/location";
import {
  LawyersFormWebhookData,
  CovidTestSupplierFormWebhookData,
} from "server/components/formRunner";
import {
  List,
  User,
  Point,
  Country,
  ListItem,
  ServiceType,
  CountryName,
  ListItemGetObject,
  LawyerListItemGetObject,
  LawyerListItemCreateInput,
  CovidTestSupplierListItemCreateInput,
  Address,
} from "./types";
import { geoPointIsValid, getListIdForCountryAndType, rawInsertGeoLocation } from "./helpers";
import { recordListItemEvent } from "./audit";
import {
  ListsRequestParams,
  listsRoutes,
  PaginationItem,
  PaginationResults,
} from "server/components/lists";
import { queryStringFromParams } from "server/components/lists/helpers";
import { legalPracticeAreasList } from "server/services/metadata";

export const ROWS_PER_PAGE: number = 10;

interface ListItemWithAddressCountry extends ListItem {
  address: Address & {
    country: Country;
  };
}

// Helpers
async function createCountry(country: string): Promise<Country> {
  const countryName = startCase(toLower(country));

  return await prisma.country.upsert({
    where: { name: countryName },
    create: { name: countryName },
    update: {},
  });
}

async function getPlaceGeoPoint(props: {
  countryName?: string;
  text?: string;
}): Promise<Point> {
  const { countryName, text } = props;

  if (text === undefined || countryName === undefined) {
    return [0.0, 0.0];
  }

  try {
    return await geoLocatePlaceByText(`${text}, ${countryName}`);
  } catch (error) {
    logger.error(error.message);

    return [0.0, 0.0];
  }
}

async function createAddressGeoLocation(
  item: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<number> {
  let address: string;

  if ("organisationDetails" in item) {
    address = `
      ${item.organisationDetails.addressLine1},
      ${item.organisationDetails.addressLine2 ?? ""},
      ${item.organisationDetails.city} -
      ${item.organisationDetails.country} -
      ${item.organisationDetails.postcode}
    `;
  } else {
    address = `
      ${item.addressLine1},
      ${item.addressLine2 ?? ""},
      ${item.city} -
      ${item.addressCountry} -
      ${item.postcode}
    `;
  }

  const point = await geoLocatePlaceByText(address);

  return await rawInsertGeoLocation(point);
}

/**
 * Constructs SQL for querying published list items.  If the region is not populated
 * or is set to "Not set" then it will be ordered by company name otherwise by distance
 * from the geo point.
 * @param props
 */
function fetchPublishedListItemQuery(props: {
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

  if (geoPointIsValid(fromGeoPoint) && (region !== undefined && region !== "" && region !== "Not set")) {
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

export async function getPaginationValues(props: {
  count: number;
  page: number;
  listRequestParams: ListsRequestParams;
}): Promise<PaginationResults> {
  const { count, page, listRequestParams } = props;
  let pageCount = 0;
  if (count > 0 && ROWS_PER_PAGE > 0) {
    pageCount = Math.ceil(count / ROWS_PER_PAGE);
  }

  const nextPrevious = getNextPrevious({
    page,
    pageCount,
    listRequestParams,
  });
  const { queryString, currentPage } = nextPrevious;

  const pageItems: PaginationItem[] = getPageItems({
    pageCount,
    currentPage,
    queryString,
  });

  const from = getFromCount({ count, currentPage });
  const to = getToCount({
    currentPage,
    pageCount,
    count,
  });

  return {
    pagination: {
      results: {
        from,
        to,
        count,
        currentPage,
      },
      previous: {
        text: nextPrevious.previous.page.toString(),
        href: nextPrevious.previous.queryString,
      },
      next: {
        text: nextPrevious.next.page.toString(),
        href: nextPrevious.next.queryString,
      },
      items: pageItems,
    },
  };
}

interface getPaginationParams {
  pageCount: number;
  page: number;
  listRequestParams: ListsRequestParams;
}

function getNextPrevious({
  page = 1,
  pageCount,
  listRequestParams,
}: getPaginationParams): {
  queryString: string;
  currentPage: number;
  previous: {
    page: number;
    queryString: string;
  };
  next: {
    page: number;
    queryString: string;
  };
} {
  let currentPage = page;
  let queryStringPrevious = "";
  let queryStringNext = "";
  let previousPage = -1;
  let nextPage = -1;

  let queryString = queryStringFromParams(listRequestParams, true);
  queryString = queryString.replace("&page=" + currentPage.toString(), "");

  if (currentPage > pageCount) {
    currentPage = pageCount;
  }

  if (currentPage > 1) {
    previousPage = currentPage - 1;
    queryStringPrevious = `${listsRoutes.results}?${queryString}&page=${previousPage}`;
  }
  if (currentPage < pageCount) {
    nextPage = currentPage + 1;
    queryStringNext = `${listsRoutes.results}?${queryString}&page=${nextPage}`;
  }
  return {
    queryString,
    currentPage,
    previous: {
      page: previousPage,
      queryString: queryStringPrevious,
    },
    next: {
      page: nextPage,
      queryString: queryStringNext,
    },
  };
}

function getPageItems(props: {
  pageCount: number;
  currentPage: number;
  queryString: string;
}): PaginationItem[] {
  const { pageCount, currentPage, queryString } = props;
  const pageItems: PaginationItem[] = [];

  for (let i = 1; i <= pageCount; i++) {
    let href = "";
    if (i >= currentPage - 2 && i <= currentPage + 2) {
      if (i !== currentPage) {
        href = `${listsRoutes.results}?${queryString}&page=${i}`;
      }
      pageItems.push({
        text: i.toString(),
        href,
      });
    }
  }
  return pageItems;
}

function getFromCount(props: {
  count: number;
  currentPage: number;
}): number {
  const { count, currentPage } = props;
  let from;

  if (count === 0) {
    from = 0;
  } else if (count < ROWS_PER_PAGE) {
    from = count - (count - 1);
  } else {
    from = ROWS_PER_PAGE * currentPage - (ROWS_PER_PAGE - 1);
  }
  return from;
}

function getToCount(props: {
  currentPage: number;
  pageCount: number;
  count: number;
}): number {
  const { currentPage, pageCount, count } = props;
  let to;
  if (currentPage === pageCount) {
    to = count;
  } else {
    to = ROWS_PER_PAGE * currentPage;
  }
  return to;
}

// Model API

export async function findListItemsForList(list: List): Promise<ListItem[]> {
  try {
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
  webhookData: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<ListItemWithAddressCountry> {
  switch (serviceType) {
    case ServiceType.lawyers:
      return await createLawyerListItem(webhookData as LawyersFormWebhookData);
    case ServiceType.covidTestProviders:
      return await createCovidTestSupplierListItem(
        webhookData as CovidTestSupplierFormWebhookData
      );
  }
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

// ListItem Helpers
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

// Lawyers
async function createLawyerListItemObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerListItemCreateInput> {
  try {
    const {
      addressCountry,
      addressLine1,
      addressLine2,
      areasOfLaw,
      city,
      familyName,
      firstAndMiddleNames,
      postcode,
      ...rest
    } = lawyer;
    const country = await createCountry(addressCountry);
    const geoLocationId = await createAddressGeoLocation(lawyer);

    const listId = await getListIdForCountryAndType(
      lawyer.country as CountryName,
      ServiceType.lawyers
    );

    return {
      type: ServiceType.lawyers,
      isApproved: false,
      isPublished: false,
      listId,
      jsonData: {
        ...rest,
        areasOfLaw: uniq(areasOfLaw ?? []),
        contactName: `${firstAndMiddleNames} ${familyName}`,
      },
      address: {
        create: {
          firstLine: addressLine1,
          secondLine: addressLine2,
          postCode: postcode,
          city,
          country: {
            connect: {
              id: country.id,
            },
          },
          geoLocation: {
            connect: {
              id: typeof geoLocationId === "number" ? geoLocationId : undefined,
            },
          },
        },
      },
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function createLawyerListItem(
  webhookData: LawyersFormWebhookData
): Promise<ListItemWithAddressCountry> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationName,
    countryName: webhookData.country,
  });

  if (exists) {
    throw new Error("Lawyer record already exists");
  }

  try {
    const data = await createLawyerListItemObject(webhookData);

    return await prisma.listItem.create({
      data,
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw error;
  }
}

export async function findPublishedLawyersPerCountry(props: {
  countryName?: string;
  region?: string | "";
  legalAid?: "yes" | "no" | "";
  proBono?: "yes" | "no" | "";
  practiceArea?: string[];
  offset?: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  const offset = props.offset ?? 0;
  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];
  const jsonQuery: {
    legalAid?: boolean;
    proBono?: boolean;
  } = {};

  if (props.legalAid === "yes") {
    jsonQuery.legalAid = true;
  }

  if (props.proBono === "yes") {
    jsonQuery.proBono = true;
  }

  if (Object.keys(jsonQuery).length > 0) {
    andWhere.push(
      `AND "ListItem"."jsonData" @> '${JSON.stringify(jsonQuery)}'`
    );
  }

  if (props.practiceArea !== undefined && props.practiceArea.length > 0) {
    let legalPracticeAreas = props.practiceArea;
    if (legalPracticeAreas.some((item) => item === "all")) {
      legalPracticeAreas = legalPracticeAreasList.map((area) =>
        area.toLowerCase()
      );
    }
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'areasOfLaw'))) && ARRAY ${JSON.stringify(
        legalPracticeAreas
      ).replace(/"/g, "'")}`
    );
  }

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.lawyers,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere: andWhere.join(" "),
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}

// Covid Test Suppliers
// TODO: Test
async function createCovidTestSupplierListItemObject(
  formData: CovidTestSupplierFormWebhookData
): Promise<CovidTestSupplierListItemCreateInput> {
  try {
    const country = await createCountry(formData.organisationDetails.country);
    const geoLocationId = await createAddressGeoLocation(formData);

    const listId = await getListIdForCountryAndType(
      formData.organisationDetails.country as CountryName,
      ServiceType.covidTestProviders
    );

    const providedTests = compact(
      formData.providedTests
        .split(", ")
        .map(trim)
        .map((testName) => {
          switch (testName) {
            case "Antigen":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimeAntigen, 10),
              };
            case "Loop-mediated Isothermal Amplification (LAMP)":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimeLamp, 10),
              };
            case "Polymerase Chain Reaction (PCR)":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimePCR, 10),
              };
            default:
              return undefined;
          }
        })
    );

    return {
      type: ServiceType.covidTestProviders,
      isApproved: false,
      isPublished: false,
      listId,
      jsonData: {
        organisationName: formData.organisationDetails.organisationName
          .toLowerCase()
          .trim(),
        contactName: formData.organisationDetails.contactName.trim(),
        contactEmailAddress: formData.organisationDetails.contactEmailAddress
          .toLocaleLowerCase()
          .trim(),
        contactPhoneNumber: formData.organisationDetails.contactPhoneNumber
          .toLocaleLowerCase()
          .trim(),
        telephone: formData.organisationDetails.phoneNumber,
        additionalTelephone: formData.organisationDetails.additionalPhoneNumber,
        email: formData.organisationDetails.emailAddress.toLowerCase().trim(),
        additionalEmail: formData.organisationDetails.additionalEmailAddress,
        website: formData.organisationDetails.websiteAddress
          .toLowerCase()
          .trim(),
        regulatoryAuthority: formData.regulatoryAuthority,
        resultsFormat: formData.resultsFormat.split(",").map(trim),
        resultsReadyFormat: formData.resultsReadyFormat.split(",").map(trim),
        bookingOptions: formData.bookingOptions
          .split(",")
          .map(trim)
          .map(toLower),
        providedTests,
        fastestTurnaround: Math.min(
          ...providedTests.map((test) => test.turnaroundTime)
        ),
      },
      address: {
        create: {
          firstLine: formData.organisationDetails.addressLine1,
          secondLine: formData.organisationDetails.addressLine2,
          postCode: formData.organisationDetails.postcode,
          city: formData.organisationDetails.city,
          country: {
            connect: { id: country.id },
          },
          ...(typeof geoLocationId === "number"
            ? {
                geoLocation: {
                  connect: {
                    id: geoLocationId,
                  },
                },
              }
            : {}),
        },
      },
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function createCovidTestSupplierListItem(
  webhookData: CovidTestSupplierFormWebhookData
): Promise<ListItemWithAddressCountry> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationDetails.organisationName,
    locationName: webhookData.organisationDetails.locationName,
    countryName: webhookData.organisationDetails.country,
  });

  if (exists) {
    throw new Error("Covid Test Supplier Record already exists");
  }

  try {
    const data = await createCovidTestSupplierListItemObject(webhookData);

    return await prisma.listItem.create({
      data,
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw error;
  }
}

export async function findPublishedCovidTestSupplierPerCountry(props: {
  countryName: string;
  region: string;
  turnaroundTime: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  // @todo page parameter needs to be retrieved from the request.  Refactor once lawyers has been implemented.
  const offset = 0;

  try {
    let andWhere: string = "";

    if (props.turnaroundTime > 0) {
      andWhere = pgescape(
        `AND ("ListItem"."jsonData"->>'fastestTurnaround')::int <= %s`,
        props.turnaroundTime
      );
    }

    const countryName = startCase(toLower(props.countryName));

    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.covidTestProviders,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere,
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedCovidTestSupplierPerCountry ERROR: ", error);
    return [];
  }
}
