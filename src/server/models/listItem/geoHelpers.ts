// Helpers
import { Country, Point } from "server/models/types";
import { startCase, toLower } from "lodash";
import { prisma } from "server/models/db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/components/formRunner";
import { rawInsertGeoLocation } from "server/models/helpers";

export async function createCountry(country: string): Promise<Country> {
  const countryName = startCase(toLower(country));

  return await prisma.country.upsert({
    where: { name: countryName },
    create: { name: countryName },
    update: {},
  });
}

export async function getPlaceGeoPoint(props: {
  countryName?: string;
  text?: string;
}): Promise<Point> {
  const { countryName = 0.0, text = 0.0 } = props;

  try {
    return await geoLocatePlaceByText(`${text}, ${countryName}`);
  } catch (error) {
    logger.error(error.message);

    return [0.0, 0.0];
  }
}

export function makeAddressGeoLocationString(
  item: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): string {
  return `
      ${item.firstLine},
      ${item.secondLine ?? ""},
      ${item.city} -
      ${item.addressCountry ?? item.country} -
      ${item.postcode}
    `;
}

export async function createAddressGeoLocation(
  item: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<number> {
  const address = makeAddressGeoLocationString(item);
  const point = await geoLocatePlaceByText(address);

  return await rawInsertGeoLocation(point);
}
