import type { TranslatorInterpreterListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
import { getPlaceGeoPoint } from "./../geoHelpers";
import { startCase, toLower } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { fetchPublishedListItemQuery } from "server/models/listItem/providers/helpers";

export interface FindPublishedTranslatorsInterpretersOptions {
  countryName?: string;
  region?: string;
  servicesProvided?: string[];
  languagesProvided?: string[];
  interpreterServices?: string[];
  translationSpecialties?: string[];
  offset?: number;
}

type Options = FindPublishedTranslatorsInterpretersOptions;

export async function findPublishedTranslatorsInterpretersPerCountry(
  props: Options
): Promise<TranslatorInterpreterListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }

  const {
    region,
    servicesProvided = ["translation", "interpretation"],
    languagesProvided,
    interpreterServices = [],
    translationSpecialties = [],
    offset = 0,
  } = props;

  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];

  if (languagesProvided) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'languagesProvided'))) && ARRAY ${JSON.stringify(
        languagesProvided
      ).replace(/"/g, "'")}`
    );
  }
  if (servicesProvided) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'servicesProvided'))) && ARRAY ${JSON.stringify(
        servicesProvided
      ).replace(/"/g, "'")}`
    );
  }

  if (!interpreterServices.includes("all") && interpreterServices.length > 0) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'interpreterServices'))) && ARRAY ${JSON.stringify(
        interpreterServices
      ).replace(/"/g, "'")}`
    );
  }
  if (!translationSpecialties.includes("all") && translationSpecialties.length > 0) {
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'translationSpecialties'))) && ARRAY ${JSON.stringify(
        translationSpecialties
      ).replace(/"/g, "'")}`
    );
  }

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.translatorsInterpreters,
      countryName,
      region: region,
      fromGeoPoint,
      andWhere: andWhere.join(" "),
      offset,
    });

    return await prisma.$queryRawUnsafe(query);
  } catch (error) {
    logger.error("findPublishedTranslatorsInterpretersPerCountry ERROR: ", error);
    return [];
  }
}
