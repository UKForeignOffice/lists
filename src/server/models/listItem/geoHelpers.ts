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
  const { countryName, text } = props;

  if (text === undefined || countryName === undefined) {
    return [0.0, 0.0];
  }

  try {
    return await geoLocatePlaceByText(`${text}, ${countryName}`);
  } catch (error) {
    logger.error(error.message);

    return [0.0, 0.0];
  }
}

export async function createAddressGeoLocation(
  item: LawyersFormWebhookData | CovidTestSupplierFormWebhookData
): Promise<number> {
  let address: string;

  if ("organisationDetails" in item) {
    address = `
      ${item.organisationDetails.addressLine1},
      ${item.organisationDetails.addressLine2 ?? ""},
      ${item.organisationDetails.city} -
      ${item.organisationDetails.country} -
      ${item.organisationDetails.postcode}
    `;
  } else {
    address = `
      ${item.addressLine1},
      ${item.addressLine2 ?? ""},
      ${item.city} -
      ${item.addressCountry} -
      ${item.postcode}
    `;
  }

  const point = await geoLocatePlaceByText(address);

  return await rawInsertGeoLocation(point);
}
