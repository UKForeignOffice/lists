import type {
  PricingPlan,
  IntendedUse} from "@aws-sdk/client-location";
import {
  LocationClient,
  CreatePlaceIndexCommand,
  ListPlaceIndexesCommand,
  SearchPlaceIndexForTextCommand
} from "@aws-sdk/client-location";
import { AWS_REGION, LOCATION_SERVICE_INDEX_NAME } from "server/config";
import { logger } from "./logger";
import getCountryCodeFromCountryName from "./country-codes";

const INDEX_PARAMS = {
  DataSource: "Esri",
  IndexName: `${LOCATION_SERVICE_INDEX_NAME}`,
  PricingPlan: "RequestBasedUsage" as PricingPlan,
  DataSourceConfiguration: {
    IntendedUse: "SingleUse" as IntendedUse,
  },
  Description: "FCDO Professional service finder",
};

let locationClient: LocationClient;
let placeIndexExists = false;

export function getAWSLocationService(): LocationClient {
  if (!locationClient) {
    locationClient = new LocationClient({
      region: AWS_REGION,
    });
  }

  return locationClient;
}

export async function checkIfPlaceIndexExists(placeIndexName: string): Promise<boolean> {
  try {
    const client = getAWSLocationService();
    const command = new ListPlaceIndexesCommand({});
    const result = await client.send(command);
    return result.Entries?.some((entry) => entry.IndexName === placeIndexName) ?? false;
  } catch (error) {
    logger.error(`checkIfPlaceIndexExists Error: ${error.message}`);
    return false;
  }
}

export async function createPlaceIndex(): Promise<boolean> {
  const client = getAWSLocationService();
  const alreadyExists = await checkIfPlaceIndexExists(INDEX_PARAMS.IndexName);

  if (alreadyExists) {
    return true;
  }

  try {
    const command = new CreatePlaceIndexCommand(INDEX_PARAMS);
    await client.send(command);
    return true;
  } catch (error) {
    logger.error(`createPlaceIndex error: ${error.message}`);
    return false;
  }
}

export async function geoLocatePlaceByText(region: string, country: string): Promise<number[]> {
  if (!placeIndexExists) {
    placeIndexExists = await createPlaceIndex();
  }

  const client = getAWSLocationService();
  const countryCode = region.toLowerCase().includes("vatican") ? "VAT" : getCountryCodeFromCountryName(country);

  if (!countryCode) throw new Error(`A country code for ${country} could not be found.`);

  const command = new SearchPlaceIndexForTextCommand({
    MaxResults: 1,
    Text: region,
    IndexName: INDEX_PARAMS.IndexName,
    FilterCountries: [countryCode],
  });

  const { Results } = await client.send(command);

  // Return location if found
  return Results?.[0]?.Place?.Geometry?.Point ?? [0.0, 0.0];
}
