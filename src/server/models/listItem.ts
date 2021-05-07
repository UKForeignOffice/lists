import { isArray, uniq, startCase, toLower } from "lodash";
import { format } from "sqlstring";
import { prisma } from "./db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { LawyersFormWebhookData } from "server/services/form-runner";
import {
  Country,
  Point,
  ListItem,
  LawyerCreateObject,
  LawyerListItemCreateObject,
} from "./types";
import { filterAllowedLegalAreas, rawInsertGeoLocation } from "./helpers";

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
  country?: string;
  text?: string;
}): Promise<Point | undefined> {
  const { country, text } = props;

  if (text === undefined || country === undefined) {
    return undefined;
  }

  try {
    const place = await geoLocatePlaceByText(`${text}, ${country}`);
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
): LawyerCreateObject["extendedProfile"]["outOfHours"] {
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
  country?: string;
  fromGeoPoint?: Point;
  filterLegalAidYes: boolean;
  practiceArea?: string[];
}): string {
  const { country, fromGeoPoint, filterLegalAidYes } = props;

  let conditionClause = (): "WHERE" | "AND" => {
    conditionClause = () => "AND";
    return "WHERE";
  };

  let withDistance = "";
  let whereCountryName = "";
  let whereLegalAid = "";
  let orderBy = `
    ORDER BY "ListItem"."jsonData"->>"organisationName" ASC
  `;

  if (country !== undefined) {
    whereCountryName = format(`${conditionClause()} "Country".name = ?`, [
      country,
    ]);
  }

  if (filterLegalAidYes) {
    whereLegalAid = `${conditionClause()} "ListItem"."jsonData" @> '{"legalAid":true}'`;
  }

  if (isArray(fromGeoPoint)) {
    withDistance = format(
      `ST_Distance(
        "GeoLocation".location,
        ST_GeographyFromText('Point(? ?)')
      ) AS distanceInMeters
    `,
      fromGeoPoint
    );

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
    ${whereCountryName}
    ${whereLegalAid}
    AND "ListItem"."isApproved" = true
    AND "ListItem"."isPublished" = true
    AND "ListItem"."isBlocked" = false
    ${orderBy}
    LIMIT 20
  `;
}

async function createLawyerListItemObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerListItemCreateObject> {
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
  country?: string;
  region?: string;
  legalAid?: "yes" | "no" | "";
  practiceArea?: string[];
}): Promise<any> {
  if (props.country === undefined) {
    return [];
  }

  const country = startCase(toLower(props.country));
  const filterLegalAidYes = props.legalAid === "yes";

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      country,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      country,
      filterLegalAidYes,
      fromGeoPoint,
    });

    const result = await prisma.$queryRaw(query);
    return result;
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}

// TODO: return type
export async function approveLawyer(reference: string): Promise<any> {
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

// TODO: return type
export async function publishLawyer(reference: string): Promise<any> {
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

// TODO: return type
export async function blockLawyer(reference: string): Promise<any> {
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

// API based on ListItem

export async function createLawyerListItem(
  webhookData: LawyersFormWebhookData
): Promise<ListItem> {
  const exists = await prisma.listItem.findFirst({
    where: {
      jsonData: {
        equals: {
          organisationName: webhookData.organisationName.toLowerCase(),
        },
      },
      address: {
        country: {
          name: webhookData.country,
        },
      },
    },
  });

  if (exists !== null) {
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
