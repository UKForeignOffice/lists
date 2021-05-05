import { isArray, upperFirst, uniq, pick, startCase, toLower } from "lodash";
import { format } from "sqlstring";
import { prisma } from "./db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { LawyersFormWebhookData } from "server/services/form-runner";
import { Country, Point, Lawyer, LawyerCreateObject } from "./types";
import { rawInsertGeoLocation } from "./helpers";

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
          firsLine: `${lawyer.outOfHours?.addressLine1}`,
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

function fetchPublishedLawyersQuery(props: {
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
    ORDER BY
    CASE WHEN "Lawyer"."lawFirmName" IS NULL THEN "Lawyer"."contactName" ELSE "Lawyer"."lawFirmName" END ASC
  `;

  if (country !== undefined) {
    whereCountryName = format(`${conditionClause()} "Country".name = ?`, [
      country,
    ]);
  }

  if (filterLegalAidYes) {
    whereLegalAid = `${conditionClause()} "Lawyer"."legalAid" = true`;
  }

  if (isArray(fromGeoPoint)) {
    withDistance = format(
      `,
      ST_Distance(
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
      "Lawyer"."contactName",
      "Lawyer"."lawFirmName",
      "Lawyer"."telephone",
      "Lawyer"."email",
      "Lawyer"."website",
      "Lawyer"."legalAid",
      "Lawyer"."proBonoService",
      (SELECT array_agg(name)
        FROM "LegalPracticeAreas" lpa
        INNER JOIN "_LawyerToLegalPracticeAreas" AS ltl ON ltl."A" = "Lawyer".id
        WHERE lpa.id = ltl."B"
      ) AS "legalPracticeAreas",

      concat_ws(', ', "Address"."firsLine", "Address"."secondLine") AS address,
      "Address"."city",
      "Address"."postCode",
      "Country".name as country

      ${withDistance}

    FROM "Lawyer"
    INNER JOIN "Address" ON "Lawyer"."addressId" = "Address".id
    INNER JOIN "Country" ON "Address"."countryId" = "Country".id
    INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
    ${whereCountryName}
    ${whereLegalAid}
    AND "Lawyer"."isApproved" = true
    AND "Lawyer"."isPublished" = true
    AND "Lawyer"."isBlocked" = false
    ${orderBy}
    LIMIT 20
  `;
}

async function createLawyerInsertObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerCreateObject> {
  try {
    const country = await createCountry(lawyer.country);
    const geoLocationId = await createAddressGeoLocation(lawyer);
    const legalPracticeAreasList = uniq(lawyer.areasOfLaw?.split(", ") ?? []);
    const outOfHours = parseOutOfHoursObject(lawyer);

    return {
      contactName: `${lawyer.firstName} ${lawyer.middleName ?? ""} ${
        lawyer.surname
      }`,
      lawFirmName: lawyer.organisationName.toLowerCase(),
      telephone: lawyer.phoneNumber,
      email: lawyer.emailAddress,
      website: lawyer.websiteAddress,
      address: {
        create: {
          firsLine: lawyer.addressLine1,
          secondLine: lawyer.addressLine2,
          postCode: lawyer.postcode,
          city: lawyer.city,
          country: {
            connect: { id: country.id },
          },
          ...(typeof geoLocationId === "number" ? { geoLocationId } : {}),
        },
      },
      legalPracticeAreas: {
        connectOrCreate: legalPracticeAreasList
          .map((name: string) => name.trim())
          .map((name) => ({
            where: { name },
            create: { name },
          })),
      },
      legalAid: lawyer.canProvideLegalAid,
      proBonoService: lawyer.canOfferProBono,
      isApproved: false,
      isPublished: false,
      extendedProfile: {
        ...pick(lawyer, [
          "regulatoryAuthority",
          "englishSpeakLead",
          "representedBritishNationalsBefore",
        ]),
        outOfHours,
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
}): Promise<Lawyer[]> {
  const country = upperFirst(props.country);
  const filterLegalAidYes = props.legalAid === "yes";

  if (props.country === undefined) {
    return [];
  }

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      country,
      text: props.region,
    });

    const query = fetchPublishedLawyersQuery({
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

export async function createLawyer(
  webhookData: LawyersFormWebhookData
): Promise<Lawyer> {
  const exists = await prisma.lawyer.findFirst({
    where: {
      lawFirmName: webhookData.organisationName.toLowerCase(),
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

  const lawyerData = await createLawyerInsertObject(webhookData);

  try {
    return await prisma.lawyer.create({ data: lawyerData });
  } catch (error) {
    logger.error(`createLawyer Error: ${error.message}`);
    throw new Error(`createLawyer Error: ${error.message}`);
  }
}

export async function approveLawyer(lawFirmName: string): Promise<Lawyer> {
  try {
    return await prisma.lawyer.update({
      where: {
        lawFirmName: lawFirmName.toLowerCase(),
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

export async function publishLawyer(lawFirmName: string): Promise<Lawyer> {
  try {
    return await prisma.lawyer.update({
      where: {
        lawFirmName: lawFirmName.toLowerCase(),
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

export async function blockLawyer(lawFirmName: string): Promise<Lawyer> {
  try {
    return await prisma.lawyer.update({
      where: {
        lawFirmName: lawFirmName.toLowerCase(),
      },
      data: {
        isBlocked: true,
        isApproved: false,
        isPublished: false,
      },
    });
  } catch (error) {
    logger.error(`blockLawyer Error ${error.message}`);
    throw new Error("Failed to publish lawyer");
  }
}
