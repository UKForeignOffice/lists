// Covid Test Suppliers
// TODO: Test
import { CovidTestSupplierFormWebhookData } from "server/components/formRunner";
import {
  CountryName,
  CovidTestSupplierListItemCreateInput,
  LawyerListItemGetObject,
  ServiceType,
} from "server/models/types";
import {
  createAddressGeoLocation,
  createCountry,
  getPlaceGeoPoint,
} from "./../geoHelpers";
import { getListIdForCountryAndType } from "server/models/helpers";
import { compact, startCase, toLower, trim } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import pgescape from "pg-escape";
import { fetchPublishedListItemQuery } from "./helpers";

export async function findPublishedCovidTestSupplierPerCountry(props: {
  countryName: string;
  region: string;
  turnaroundTime: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  // @todo page parameter needs to be retrieved from the request.  Refactor once lawyers has been implemented.
  const offset = 0;

  try {
    let andWhere: string = "";

    if (props.turnaroundTime > 0) {
      andWhere = pgescape(
        `AND ("ListItem"."jsonData"->>'fastestTurnaround')::int <= %s`,
        props.turnaroundTime
      );
    }

    const countryName = startCase(toLower(props.countryName));

    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.covidTestProviders,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere,
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedCovidTestSupplierPerCountry ERROR: ", error);
    return [];
  }
}
