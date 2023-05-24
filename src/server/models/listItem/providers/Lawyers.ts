import { LawyerListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
import { getPlaceGeoPoint } from "./../geoHelpers";
import { logger } from "server/services/logger";
import { prisma } from "shared/prisma";;
import { fetchPublishedListItemQuery } from "server/models/listItem/providers/helpers";

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
  const countryName = props.countryName;
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
    andWhere.push(`AND "ListItem"."jsonData" @> '${JSON.stringify(jsonQuery)}'`);
  }

  if (props.practiceArea !== undefined && props.practiceArea.length > 0) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'areasOfLaw'))) && ARRAY ${JSON.stringify(
        props.practiceArea
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

    return await prisma.$queryRawUnsafe(query);
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}
