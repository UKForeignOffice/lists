import { isArray, upperFirst } from "lodash";
import { format } from "sqlstring";
import { prisma } from "./db/prisma-client";
import { locatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { Point, Lawyer } from "./types";

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
    const place = await locatePlaceByText(`${text}, ${country}`);
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
