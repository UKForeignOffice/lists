import { Location } from "@aws-sdk/client-location";
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
      region: AWS_REGION,
    });
  }

  return location;
}

export async function checkIfPlaceIndexExists(placeIndexName: string): Promise<boolean | undefined> {
  try {
    const location = getAWSLocationService();
    const result = await location.listPlaceIndexes();
    return result?.Entries?.some((entry) => entry.IndexName === placeIndexName);
  } catch (error) {
    logger.error(`checkIfPlaceIndexExists Error: ${error.message}`);
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
    // @ts-ignore
    await location.createPlaceIndex(INDEX_PARAMS);
    return true;
  } catch (error) {
    const typedError = error as Error;
    logger.error(`createPlaceIndex error: ${typedError.message}`);
    return false;
  }
}

export async function geoLocatePlaceByText(region: string, country: string): Promise<number[]> {
  if (!placeIndexExists) {
    placeIndexExists = await createPlaceIndex();
  }

  const location = getAWSLocationService();
  const countryCode = region?.toLowerCase?.().includes("vatican") ? "VAT" : getCountryCodeFromCountryName(country);

  if (!countryCode) throw new Error(`A country code for ${country} could not be found.`);

  const { Results } = await location.searchPlaceIndexForText({
    MaxResults: 1,
    Text: `${region}`,
    IndexName: INDEX_PARAMS.IndexName,
    FilterCountries: [countryCode],
  });

  if (Results && Results.length > 0) {
    const firstResult = Results[0]; // Access the first object in the Results array
    return firstResult.Place?.Geometry?.Point ?? [0.0, 0.0]; // Correct access to Place and Geometry
  }

  // Otherwise point to Null Island (https://en.wikipedia.org/wiki/Null_Island)
  return [0.0, 0.0];
}
