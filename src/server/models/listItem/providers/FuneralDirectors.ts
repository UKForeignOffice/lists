import { FuneralDirectorListItemGetObject, ServiceType } from "server/models/types";
import { getPlaceGeoPoint } from "./../geoHelpers";
import { startCase, toLower } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { fetchPublishedListItemQuery } from "server/models/listItem/providers/helpers";

export async function findPublishedFuneralDirectorsPerCountry(props: {
  countryName?: string;
  region?: string | "";
  repatriation?: string | "";
  offset?: number;
}): Promise<FuneralDirectorListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  const offset = props.offset ?? 0;
  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];
  const jsonQuery: {
    repatriation?: boolean;
  } = {};

  if (props.repatriation === "yes") {
    jsonQuery.repatriation = true;
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
      type: ServiceType.funeralDirectors,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere: andWhere.join(" "),
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedFuneralDirectors ERROR: ", error);
    return [];
  }
}
