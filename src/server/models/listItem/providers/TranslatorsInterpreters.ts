import type { TranslatorInterpreterListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
import { getPlaceGeoPoint } from "./../geoHelpers";
import { startCase, toLower } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "shared/prisma";
import { fetchPublishedListItemQuery } from "server/models/listItem/providers/helpers";

export async function findPublishedTranslatorsInterpretersPerCountry(props: {
  countryName?: string;
  region?: string | "";
  servicesProvided?: string[];
  languagesProvided?: string[];
  interpreterServices?: string[];
  translationSpecialties?: string[];
  offset?: number;
}): Promise<TranslatorInterpreterListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  const offset = props.offset ?? 0;
  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];

  if (props.languagesProvided) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'languagesProvided'))) && ARRAY ${JSON.stringify(
        props.languagesProvided
      ).replace(/"/g, "'")}`
    );
  }
  if (props.servicesProvided && props.servicesProvided.length > 0 && !props.servicesProvided.includes("all")) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'servicesProvided'))) && ARRAY ${JSON.stringify(
        props.servicesProvided
      ).replace(/"/g, "'")}`
    );
  }
  if (props.interpreterServices && !props.interpreterServices?.includes("all")) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'interpreterServices'))) && ARRAY ${JSON.stringify(
        props.interpreterServices
      ).replace(/"/g, "'")}`
    );
  }
  if (props.translationSpecialties && !props.translationSpecialties?.includes("all")) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'translationSpecialties'))) && ARRAY ${JSON.stringify(
        props.translationSpecialties
      ).replace(/"/g, "'")}`
    );
  }

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.translatorsInterpreters,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere: andWhere.join(" "),
      offset,
    });

    return await prisma.$queryRawUnsafe(query);
  } catch (error) {
    logger.error("findPublishedTranslatorsInterpreters ERROR: ", error);
    return [];
  }
}
