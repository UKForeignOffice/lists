import { Location } from "aws-sdk";
import { AWS_REGION, LOCATION_SERVICE_INDEX_NAME } from "server/config";
import { logger } from "./logger";
import getCountryCodeFromCountryName from "./country-codes";

const INDEX_PARAMS = {
  DataSource: "Esri",
  IndexName: `${LOCATION_SERVICE_INDEX_NAME}`,
  PricingPlan: "RequestBasedUsage",
  DataSourceConfiguration: {
    IntendedUse: "SingleUse",
  },
  Description: "FCDO Professional service finder",
};

let location: Location;
let placeIndexExists = false;

export function getAWSLocationService(): Location {
  if (location === undefined) {
    location = new Location({
      apiVersion: "2020-11-19",
      region: AWS_REGION,
    });
  }

  return location;
}

export async function checkIfPlaceIndexExists(
  placeIndexName: string
): Promise<boolean> {
  try {
    const location = getAWSLocationService();
    const result = await location.listPlaceIndexes().promise();
    return result?.Entries?.some((entry) => entry.IndexName === placeIndexName);
  } catch (error) {
    const typedError = error as { message: string };
    logger.error(`checkIfPlaceIndexExists Error: ${typedError.message}`);
    return false;
  }
}

export async function createPlaceIndex(): Promise<boolean> {
  const location = getAWSLocationService();
  const alreadyExists = await checkIfPlaceIndexExists(INDEX_PARAMS.IndexName);

  if (alreadyExists) {
    return true;
  }

  try {
    await location.createPlaceIndex(INDEX_PARAMS).promise();
    return true;
  } catch (error) {
    const typedError = error as { message: string };
    logger.error(`createPlaceIndex error: ${typedError.message}`);
    return false;
  }
}

export async function geoLocatePlaceByText(
  region: string,
  country: string
): Promise<Location.Types.Position> {
  if (!placeIndexExists) {
    placeIndexExists = await createPlaceIndex();
  }

  const location = getAWSLocationService();
  const countryCode = region.toLowerCase().includes("vatican")
    ? "VAT"
    : getCountryCodeFromCountryName(country);

  if (!countryCode)
    throw new Error(`A country code for ${country} could not be found.`);

  const { Results } = await location
    .searchPlaceIndexForText({
      MaxResults: 1,
      Text: region,
      IndexName: INDEX_PARAMS.IndexName,
      FilterCountries: [countryCode],
    })
    .promise();

  // Return location if found
  if (Results.length > 0) {
    return Results[0].Place.Geometry.Point ?? [0.0, 0.0];
  }

  // Otherwise point to Null Island (https://en.wikipedia.org/wiki/Null_Island)
  return [0.0, 0.0];
}
