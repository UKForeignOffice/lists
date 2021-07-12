import { isArray, uniq, startCase, toLower, merge, get, trim } from "lodash";
import pgescape from "pg-escape";
import { prisma } from "./db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { LawyersFormWebhookData } from "server/services/form-runner";
import {
  Point,
  Country,
  ListItem,
  ServiceType,
  LawyerListItemJsonData,
  LawyerListItemGetObject,
  LawyerListItemCreateInput,
  CovidTestSupplierListItemCreateInput,
  List,
  ListItemGetObject,
  CountryName,
  User,
} from "./types";
import {
  geoPointIsValid,
  rawInsertGeoLocation,
  filterAllowedLegalAreas,
} from "./helpers";
import { CovidTestSupplierFormWebhookData } from "server/services/form-runner/types";
import { recordListItemEvent } from "./audit";

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
}): Promise<Point | undefined> {
  const { countryName, text } = props;

  if (text === undefined || countryName === undefined) {
    return undefined;
  }

  try {
    const place = await geoLocatePlaceByText(`${text}, ${countryName}`);
    return place?.Geometry?.Point ?? undefined;
  } catch (error) {
    return undefined;
  }
}

async function createAddressGeoLocation(
  item: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<number | boolean> {
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
      ${item.country} - 
      ${item.postcode}
    `;
  }

  const location = await geoLocatePlaceByText(address);
  const point = location?.Geometry?.Point;

  if (isArray(point)) {
    return await rawInsertGeoLocation(point);
  }

  return false;
}

function parseOutOfHoursObject(
  lawyer: LawyersFormWebhookData
): LawyerListItemJsonData["outOfHours"] {
  const telephone = lawyer.outOfHours?.phoneNumber;
  const email = lawyer.outOfHours?.emailAddress;
  const address =
    lawyer.outOfHours?.country !== undefined
      ? {
          firstLine: `${lawyer.outOfHours?.addressLine1}`,
          secondLine: lawyer.outOfHours?.addressLine2,
          postCode: `${lawyer.outOfHours?.postcode}`,
          city: `${lawyer.outOfHours?.city}`,
        }
      : {};

  return {
    email,
    telephone,
    ...address,
  };
}

function fetchPublishedListItemQuery(props: {
  type: string;
  countryName: string;
  fromGeoPoint?: Point;
  andWhere?: string;
}): string {
  const { type, countryName, fromGeoPoint, andWhere } = props;
  const whereType = pgescape(`WHERE "ListItem"."type" = %L`, type);
  const whereCountryName = pgescape(`AND "Country".name = %L`, countryName);

  let withDistance = "";
  let orderBy = 'ORDER BY "ListItem"."jsonData"->>"organisationName" ASC';

  if (geoPointIsValid(fromGeoPoint)) {
    withDistance = `ST_Distance(
        "GeoLocation".location,
        ST_GeographyFromText('Point(${fromGeoPoint?.join(" ")})')
      ) AS distanceInMeters
    `;

    orderBy = "ORDER BY distanceInMeters ASC";
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
 	    ) as address,
      ${withDistance}	   

    FROM "ListItem"
 	  INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
	  INNER JOIN "Country" ON "Address"."countryId" = "Country".id
    INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
    ${whereType}
    ${whereCountryName}
    ${andWhere ?? ""}
    AND "ListItem"."isApproved" = true
    AND "ListItem"."isPublished" = true
    AND "ListItem"."isBlocked" = false
    ${orderBy}
    LIMIT 20
  `;
}

export async function checkListItemExists({
  organisationName,
  countryName,
}: {
  organisationName: string;
  countryName: string;
}): Promise<boolean> {
  const total = await prisma.listItem.count({
    where: {
      jsonData: {
        path: ["organisationName"],
        equals: organisationName.toLocaleLowerCase(),
      },
      address: {
        country: {
          name: startCase(countryName),
        },
      },
    },
  });

  return total > 0;
}

async function createLawyerListItemObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerListItemCreateInput> {
  try {
    const country = await createCountry(lawyer.country);
    const geoLocationId = await createAddressGeoLocation(lawyer);
    const legalPracticeAreasList = uniq(lawyer.areasOfLaw?.split(/;|,/) ?? []);
    const outOfHours = parseOutOfHoursObject(lawyer);

    return {
      type: ServiceType.lawyers,
      isApproved: false,
      isPublished: false,
      jsonData: {
        organisationName: lawyer.organisationName.toLowerCase().trim(),
        contactName: `${lawyer.firstName.trim()} ${
          lawyer.middleName?.trim() ?? ""
        } ${lawyer.surname.trim()}`,
        telephone: lawyer.phoneNumber,
        email: lawyer.emailAddress.toLowerCase().trim(),
        website: lawyer.websiteAddress.toLowerCase().trim(),
        legalPracticeAreas: filterAllowedLegalAreas(
          legalPracticeAreasList.map((name: string) =>
            name.trim().toLowerCase()
          )
        ),
        regulatoryAuthority: lawyer.regulatoryAuthority,
        englishSpeakLead: lawyer.englishSpeakLead,
        representedBritishNationalsBefore:
          lawyer.representedBritishNationalsBefore,
        legalAid: lawyer.canProvideLegalAid,
        proBonoService: lawyer.canOfferProBono,
        outOfHours,
      },
      address: {
        create: {
          firstLine: lawyer.addressLine1,
          secondLine: lawyer.addressLine2,
          postCode: lawyer.postcode,
          city: lawyer.city,
          country: {
            connect: { id: country.id },
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
    const message = `createLawyerInsertObject Error: ${error.message}`;
    logger.error(message);
    throw new Error(message);
  }
}

// TODO: Test
async function createCovidTestSupplierListItemObject(
  covidTestProvider: CovidTestSupplierFormWebhookData
): Promise<CovidTestSupplierListItemCreateInput> {
  try {
    const country = await createCountry(
      covidTestProvider.organisationDetails.country
    );
    const geoLocationId = await createAddressGeoLocation(covidTestProvider);

    return {
      type: ServiceType.covidTestProviders,
      isApproved: false,
      isPublished: false,
      jsonData: {
        organisationName: covidTestProvider.organisationDetails.organisationName
          .toLowerCase()
          .trim(),
        contactName: covidTestProvider.organisationDetails.contactName.trim(),
        contactEmailAddress:
          covidTestProvider.organisationDetails.contactEmailAddress
            .toLocaleLowerCase()
            .trim(),
        contactPhoneNumber:
          covidTestProvider.organisationDetails.contactPhoneNumber
            .toLocaleLowerCase()
            .trim(),
        telephone: covidTestProvider.organisationDetails.phoneNumber,
        email: covidTestProvider.organisationDetails.emailAddress
          .toLowerCase()
          .trim(),
        website: covidTestProvider.organisationDetails.websiteAddress
          .toLowerCase()
          .trim(),
        openingTimes: covidTestProvider.openingTimes,
        regulatoryAuthority: covidTestProvider.regulatoryAuthority,
        provideResultsInEnglishFrenchSpanish:
          covidTestProvider.provideResultsInEnglishFrenchSpanish,
        provideTestResultsIn72Hours:
          covidTestProvider.provideTestResultsIn72Hours,
        provideResultsWhenClosed: covidTestProvider.provideResultsWhenClosed,
        resultsFormat: covidTestProvider.resultsFormat?.split(",").map(trim),
        bookingOptions: covidTestProvider.bookingOptions
          ?.split(",")
          .map(trim)
          .map(toLower),
        turnaroundTime: Number(covidTestProvider.turnaroundTime),
      },
      address: {
        create: {
          firstLine: covidTestProvider.organisationDetails.addressLine1,
          secondLine: covidTestProvider.organisationDetails.addressLine2,
          postCode: covidTestProvider.organisationDetails.postcode,
          city: covidTestProvider.organisationDetails.city,
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
    const message = `createCovidTestSupplierListItemObject Error: ${error.message}`;
    logger.error(message);
    throw new Error(message);
  }
}

// Model API

export async function findListItemsForList(list: List): Promise<ListItem[]> {
  try {
    const where = {
      type: list.type,
      address: {
        countryId: list.countryId,
      },
      jsonData: {
        path: ["metadata", "emailVerified"],
        equals: true,
      },
    };

    return await prisma.listItem.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });
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
}): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("togglerListItemIsPublished Error: userId is undefined");
  }

  try {
    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: { id },
        data: { isPublished },
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

export async function setEmailIsVerified({
  reference,
}: {
  reference: string;
}): Promise<boolean> {
  try {
    const item = await prisma.listItem.findUnique({
      where: { reference },
    });

    if (get(item, "jsonData.metadata.emailVerified") === true) {
      return true;
    }

    const jsonData = merge(item?.jsonData, {
      metadata: { emailVerified: true },
    });

    await prisma.listItem.update({
      where: { reference },
      data: { jsonData },
    });

    return true;
  } catch (error) {
    const message = `setEmailIsVerified Error ${error.message}`;
    logger.error(message);
    throw new Error(message);
  }
}

export async function createListItem(
  serviceType: ServiceType,
  webhookData: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<ListItem> {
  switch (serviceType) {
    case ServiceType.lawyers:
      return await createLawyerListItem(webhookData as LawyersFormWebhookData);
    case ServiceType.covidTestProviders:
      return await createCovidTestSupplierListItem(
        webhookData as CovidTestSupplierFormWebhookData
      );
  }
}

// TODO test
export async function some(
  countryName: CountryName,
  serviceType: ServiceType
): Promise<boolean> {
  try {
    const result = await prisma.listItem.findMany({
      where: {
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

// Lawyers
export async function findPublishedLawyersPerCountry(props: {
  countryName?: string;
  region?: string;
  legalAid?: "yes" | "no" | "";
  proBono?: "yes" | "no" | "";
  practiceArea?: string[];
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }

  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];
  const jsonQuery: {
    legalAid?: boolean;
    proBonoService?: boolean;
  } = {};

  if (props.legalAid === "yes") {
    jsonQuery.legalAid = true;
  }

  if (props.proBono === "yes") {
    jsonQuery.proBonoService = true;
  }

  if (Object.keys(jsonQuery).length > 0) {
    andWhere.push(
      `AND "ListItem"."jsonData" @> '${JSON.stringify(jsonQuery)}'`
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
      fromGeoPoint,
      andWhere: andWhere.join(" "),
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}

export async function createLawyerListItem(
  webhookData: LawyersFormWebhookData
): Promise<ListItem> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationName,
    countryName: webhookData.country,
  });

  if (exists) {
    throw new Error("Lawyer record already exists");
  }

  try {
    const data = await createLawyerListItemObject(webhookData);
    return await prisma.listItem.create({ data });
  } catch (error) {
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw error;
  }
}

// Covid Test Suppliers
// TODO test
export async function findPublishedCovidTestSupplierPerCountry(props: {
  countryName: string;
  region: string;
  turnaroundTime: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }

  try {
    let andWhere: string = "";

    if (props.turnaroundTime > 0) {
      andWhere = pgescape(
        `AND ("ListItem"."jsonData"->>'turnaroundTime')::int <= %s`,
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
      fromGeoPoint,
      andWhere,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedCovidTestSupplierPerCountry ERROR: ", error);
    return [];
  }
}

// TODO test
export async function createCovidTestSupplierListItem(
  webhookData: CovidTestSupplierFormWebhookData
): Promise<ListItem> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationDetails.organisationName,
    countryName: webhookData.organisationDetails.country,
  });

  if (exists) {
    throw new Error("Covid Test Supplier Record already exists");
  }

  try {
    const data = await createCovidTestSupplierListItemObject(webhookData);
    return await prisma.listItem.create({ data });
  } catch (error) {
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw error;
  }
}
