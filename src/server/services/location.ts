import { Location } from "aws-sdk";
import { AWS_REGION, LOCATION_SERVICE_INDEX_NAME } from "server/config";
import { logger } from "./logger";

// TODO
// if (GOVUK_NOTIFY_API_KEY === undefined) {
//   throw new Error("Environment variable GOVUK_NOTIFY_API_KEY is missing");
// }

const INDEX_PARAMS = {
  DataSource: "Esri",
  IndexName: LOCATION_SERVICE_INDEX_NAME ?? "",
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
    logger.error("Location service:", error);
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
    logger.error(error);
    return false;
  }
}

export async function geoLocatePlaceByText(
  address: string
): Promise<Location.Types.Place | undefined> {
  const query = {
    MaxResults: 1,
    Text: address,
    IndexName: INDEX_PARAMS.IndexName,
  };

  if (!placeIndexExists) {
    placeIndexExists = await createPlaceIndex();
  }

  try {
    const location = getAWSLocationService();
    const response = await location.searchPlaceIndexForText(query).promise();
    return response?.Results?.[0]?.Place;
  } catch (error) {
    logger.error(error);
    return undefined;
  }
}
