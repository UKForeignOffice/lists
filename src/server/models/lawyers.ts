import { isArray, upperFirst, uniq } from "lodash";
import { format } from "sqlstring";
import { prisma } from "./db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { LawyersFormWebhookData } from "server/services/form-runner";
import { Point, Lawyer, LawyerCreateObject } from "./types";
import { rawInsertGeoLocation } from "./helpers";

// Helpers
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

function fetchPublishedLawyersQuery(props: {
  country?: string;
  distanceFromPoint?: Point;
  filterLegalAidYes: boolean;
  practiceArea?: string[];
}): string {
  const { country, distanceFromPoint, filterLegalAidYes } = props;

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

  if (isArray(distanceFromPoint)) {
    withDistance = format(
      `,
      ST_Distance(
        "GeoLocation".location,
        ST_GeographyFromText('Point(? ?)')
      ) AS distanceInMeters
    `,
      distanceFromPoint
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

// TODO: test
async function createLawyerInsertObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerCreateObject> {
  try {
    const countryName = upperFirst(lawyer.country);

    const country = await prisma.country.upsert({
      where: { name: countryName },
      create: { name: countryName },
      update: {},
    });

    const legalPracticeAreasList = uniq<string>(
      lawyer.areasOfLaw?.split(", ") ?? []
    );

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
    const distanceFromPoint = await getPlaceGeoPoint({
      country,
      text: props.region,
    });

    const query = fetchPublishedLawyersQuery({
      country,
      filterLegalAidYes,
      distanceFromPoint,
    });

    const result = await prisma.$queryRaw(query);
    return result;
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}

// TODO: test
export async function createLawyer(
  webhookData: LawyersFormWebhookData
): Promise<Lawyer> {
  const exists = await prisma.lawyer.findFirst({
    where: {
      lawFirmName: webhookData.organisationName,
    },
  });

  if (exists !== null) {
    throw new Error("Record already exists");
  }

  const lawyerData = await createLawyerInsertObject(webhookData);

  try {
    const address = `
      ${webhookData.addressLine1}, 
      ${webhookData.addressLine2 ?? ""}, 
      ${webhookData.city} - 
      ${webhookData.country} - 
      ${webhookData.postcode}
    `;

    const location = await geoLocatePlaceByText(address);
    const point = location?.Geometry?.Point;

    if (isArray(point)) {
      const locationId = await rawInsertGeoLocation(point);

      if (locationId >= 0) {
        Object.assign(lawyerData.address.create, {
          geoLocationId: locationId,
        });
      }
    }

    return await prisma.lawyer.create({ data: lawyerData });
  } catch (error) {
    logger.error(`createLawyer Error: ${error.message}`);
    throw new Error(`createLawyer Error: ${error.message}`);
  }
}
