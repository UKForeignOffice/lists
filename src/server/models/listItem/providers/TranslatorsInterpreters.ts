import { TranslatorInterpreterListItemGetObject, ServiceType } from "server/models/types";
import { getPlaceGeoPoint } from "./../geoHelpers";
import { startCase, toLower } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { fetchPublishedListItemQuery } from "server/models/listItem/providers/helpers";

export async function findPublishedTranslatorsInterpretersPerCountry(props: {
  countryName?: string;
  region?: string | "";
  servicesProvided?: string[],
  languagesProvided?: string | string[],
  interpreterServices?: string[],
  translationSpecialties?: string[],
  offset?: number;
}): Promise<TranslatorInterpreterListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  const offset = props.offset ?? 0;
  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];

  if (props.languagesProvided) {
    const languagesProvided = props.languagesProvided as string;
    const languagesProvidedArray = languagesProvided?.split(",").map((language: string) =>
      language.toLowerCase()
    );
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'languagesProvided'))) && ARRAY ${JSON.stringify(
        languagesProvidedArray
      ).replace(/"/g, "'")}`
    );
  }
  if (props.servicesProvided && props.servicesProvided.length > 0 && !props.servicesProvided.includes("all")) {
    let servicesProvided = props.servicesProvided;
    servicesProvided = servicesProvided.map((service: string) =>
      service.toLowerCase()
    );

    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'servicesProvided'))) && ARRAY ${JSON.stringify(
        servicesProvided
      ).replace(/"/g, "'")}`
    );
  }
  if (props.interpreterServices && props.interpreterServices.length > 0 && !props.interpreterServices.includes("all")) {
    let interpreterServices = props.interpreterServices;
    interpreterServices = interpreterServices.map((service: string) =>
      service.toLowerCase()
    );

    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'interpreterServices'))) && ARRAY ${JSON.stringify(
        interpreterServices
      ).replace(/"/g, "'")}`
    );
  }
  if (props.translationSpecialties && props.translationSpecialties.length > 0 && !props.translationSpecialties.includes("all")) {
    let translationSpecialties = props.translationSpecialties;
    translationSpecialties = translationSpecialties.map((service: string) =>
      service.toLowerCase()
    );

    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'translationSpecialties'))) && ARRAY ${JSON.stringify(
        translationSpecialties
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

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedTranslatorsInterpreters ERROR: ", error);
    return [];
  }
}