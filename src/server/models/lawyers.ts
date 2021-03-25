import { isArray, upperFirst } from "lodash";
import { prisma } from "./prisma-client";
import { locatePlaceByText } from "services/location";
import { logger } from "services/logger";

type Point = number[];

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
}): string {
  const { country, distanceFromPoint } = props;

  let withDistance: string = "";
  let whereCountryName = "";
  let orderBy: string = `
    ORDER BY
    CASE WHEN lawyer."lawFirmName" IS NULL THEN lawyer."contactName" ELSE lawyer."lawFirmName" END ASC
  `;

  if (country !== undefined) {
    whereCountryName = `WHERE country.name = '${country}'`;
  }

  if (isArray(distanceFromPoint)) {
    withDistance = `
      ,
      ST_Distance(
        geo.location,
        ST_GeographyFromText('Point(${distanceFromPoint[0]} ${distanceFromPoint[1]})')
      ) AS distanceInMeters
    `;

    orderBy = "ORDER BY distanceInMeters ASC";
  }

  return `
    SELECT
      lawyer."contactName",
      lawyer."lawFirmName",
      lawyer."telephone",
      lawyer."email",
      lawyer."website",
      lawyer."legalAid",
      lawyer."proBonoService",

      concat_ws(', ', address."firsLine", address."secondLine") AS address,
      address."city",
      address."postCode",

      country.name as country

      ${withDistance}

    FROM public.lawyer AS lawyer
    INNER JOIN public.address AS address ON lawyer."addressId" = address.id
    INNER JOIN public.country AS country ON address."countryId" = country.id
    INNER JOIN public.geo_location AS geo ON address."geoLocationId" = geo.id
    ${whereCountryName}
    AND lawyer."isApproved" = true
    AND lawyer."isPublished" = true
    AND lawyer."isBlocked" = false
    ${orderBy}
  `;
}


// Model API 

export async function findPublishedLawyersPerCountry(props: { country?: string, region?: string}): Promise<any[]> {
  const country = upperFirst(props.country);

  if (props.country === undefined) {
    return [];
  }

  try {
    const distanceFromPoint = await getPlaceGeoPoint({
      country,
      text: props.region
    });

    const query = fetchPublishedLawyersQuery({
      country,
      distanceFromPoint,
    });
    
    return await prisma.$queryRaw(query);;
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return []
  }
}