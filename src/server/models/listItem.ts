import { isArray, uniq, startCase, toLower, merge, get } from "lodash";
import pgescape from "pg-escape";
import { prisma } from "./db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { LawyersFormWebhookData } from "server/services/form-runner";
import {
  Country,
  Point,
  ListItem,
  LawyerListItemCreateInput,
  LawyerListItemGetObject,
  LawyerListItemJsonData,
} from "./types";
import {
  filterAllowedLegalAreas,
  geoPointIsValid,
  rawInsertGeoLocation,
} from "./helpers";

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
  lawyer: LawyersFormWebhookData
): Promise<number | boolean> {
  const location = await geoLocatePlaceByText(`
      ${lawyer.addressLine1}, 
      ${lawyer.addressLine2 ?? ""}, 
      ${lawyer.city} - 
      ${lawyer.country} - 
      ${lawyer.postcode}
  `);

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

async function checkListItemExists({
  organisationName,
}: {
  organisationName?: string;
}): Promise<boolean> {
  const jsonQuery: {
    organisationName?: string;
  } = {};

  if (organisationName !== undefined) {
    jsonQuery.organisationName = pgescape.string(
      organisationName?.toLowerCase()
    );
  }

  const query = `
    SELECT COUNT(*) 
    FROM "ListItem" 
    WHERE "ListItem"."jsonData" @> '${JSON.stringify(jsonQuery)}' 
    LIMIT 1
  `;

  const result = await prisma.$queryRaw(query);
  return result?.["0"].count > 0;
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
      type: "lawyer",
      isApproved: false,
      isPublished: false,
      jsonData: {
        organisationName: lawyer.organisationName.toLowerCase().trim(),
        contactName: `${lawyer.firstName} ${lawyer.middleName ?? ""} ${
          lawyer.surname
        }`.trim(),
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
          ...(typeof geoLocationId === "number" ? { geoLocationId } : {}),
        },
      },
    };
  } catch (error) {
    const message = `createLawyerInsertObject Error: ${error.message}`;
    logger.error(message);
    throw new Error(message);
  }
}

// Model API

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
      type: "lawyer",
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

// TODO test
export async function findPublishedCovidTestSupplierPerCountry(props: {
  countryName: string;
  region: string;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }

  const countryName = startCase(toLower(props.countryName));

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: "lawyer",
      countryName,
      fromGeoPoint,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedCovidTestSupplierPerCountry ERROR: ", error);
    return [];
  }
}

export async function createLawyerListItem(
  webhookData: LawyersFormWebhookData
): Promise<ListItem> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationName,
  });

  if (exists) {
    throw new Error("Record already exists");
  }

  try {
    const lawyerData = await createLawyerListItemObject(webhookData);
    return await prisma.listItem.create({ data: lawyerData });
  } catch (error) {
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw new Error(`createLawyerListItem Error: ${error.message}`);
  }
}

export async function approveListItem({
  reference,
}: {
  reference: string;
}): Promise<ListItem> {
  try {
    return await prisma.listItem.update({
      where: {
        reference,
      },
      data: {
        isApproved: true,
      },
    });
  } catch (error) {
    logger.error(`approveLawyer Error ${error.message}`);
    throw new Error("Failed to approve lawyer");
  }
}

export async function publishListItem({
  reference,
}: {
  reference: string;
}): Promise<ListItem> {
  try {
    return await prisma.listItem.update({
      where: {
        reference,
      },
      data: {
        isPublished: true,
      },
    });
  } catch (error) {
    logger.error(`publishLawyer Error ${error.message}`);
    throw new Error("Failed to publish lawyer");
  }
}

export async function blockListItem({
  reference,
}: {
  reference: string;
}): Promise<ListItem> {
  try {
    return await prisma.listItem.update({
      where: {
        reference,
      },
      data: {
        isBlocked: true,
      },
    });
  } catch (error) {
    logger.error(`blockLawyer Error ${error.message}`);
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
