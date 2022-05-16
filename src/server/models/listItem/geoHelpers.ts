// Helpers
import { Country, Point } from "server/models/types";
import { startCase, toLower } from "lodash";
import { prisma } from "server/models/db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { DeserialisedWebhookData } from "server/components/formRunner";
import { rawInsertGeoLocation } from "server/models/helpers";
import { Prisma } from "@prisma/client";

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
  webhookData: DeserialisedWebhookData
): string {
  return `
      ${webhookData["address.firstLine"] ?? ""},
      ${webhookData["address.secondLine"] ?? ""},
      ${webhookData.city} -
      ${webhookData.addressCountry ?? webhookData.country} -
      ${webhookData.postCode}
    `;
}

export async function createAddressGeoLocation(
  item: DeserialisedWebhookData
): Promise<number> {
  const address = makeAddressGeoLocationString(item);
  const point = await geoLocatePlaceByText(address);

  return await rawInsertGeoLocation(point);
}

export async function createAddressObject(
  webhookData: DeserialisedWebhookData
): Promise<Prisma.AddressCreateNestedOneWithoutListItemInput> {
  const {
    "address.firstLine": firstLine,
    "address.secondLine": secondLine,
    postCode,
    city,
    addressCountry,
    country,
  } = webhookData;

  const geoLocationId = await createAddressGeoLocation(webhookData);
  const dbCountry = await createCountry(addressCountry ?? country);

  return {
    create: {
      firstLine,
      secondLine,
      postCode,
      city,
      country: {
        connect: {
          id: dbCountry.id,
        },
      },
      geoLocation: {
        connect: {
          id: geoLocationId,
        },
      },
    },
  };
}
