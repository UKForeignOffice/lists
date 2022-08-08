// Helpers
import { Country, Point } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import { geoLocatePlaceByText } from "server/services/location";
import { logger } from "server/services/logger";
import { rawInsertGeoLocation } from "server/models/helpers";
import { Prisma } from "@prisma/client";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";

export async function createCountry(country: string): Promise<Country> {
  return await prisma.country.upsert({
    where: { name: country },
    create: { name: country },
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
  const address = [
    webhookData["address.firstLine"],
    webhookData["address.secondLine"],
    webhookData.city,
    webhookData.addressCountry ?? webhookData.country,
    webhookData.postCode,
  ]
    .filter(Boolean)
    .map((addressLine) => addressLine?.trim());

  return address.join(", ");
}

export async function createAddressGeoLocation(
  item: DeserialisedWebhookData
): Promise<number> {
  const address = makeAddressGeoLocationString(item);
  // TODO:- pass country into geoLocatePlaceByText so we can filter by country via AWS
  const point = await geoLocatePlaceByText(address);

  return await rawInsertGeoLocation(point);
}

export async function createAddressObject(
  webhookData: DeserialisedWebhookData
): Promise<Prisma.AddressCreateNestedOneWithoutListItemInput> {
  const {
    "address.firstLine": firstLine,
    "address.secondLine": secondLine,
    postCode = "",
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
