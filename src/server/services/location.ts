import { Location } from "aws-sdk";
import { AWS_REGION, LOCATION_SERVICE_INDEX_NAME } from "server/config";
import { logger } from "./logger";

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
    await location.createPlaceIndex(INDEX_PARAMS).promise();
    return true;
  } catch (error) {
    logger.error(`createPlaceIndex error: ${error.message}`);
    return false;
  }
}

// TODO:- pass country into geoLocatePlaceByText so we can filter by country via AWS
export async function geoLocatePlaceByText(
  Text: string
): Promise<Location.Types.Position> {
  if (!placeIndexExists) {
    placeIndexExists = await createPlaceIndex();
  }

  const location = getAWSLocationService();
  const { Results } = await location
    .searchPlaceIndexForText({
      MaxResults: 1,
      Text,
      IndexName: INDEX_PARAMS.IndexName,
    })
    .promise();

  // Return location if found
  if (Results.length > 0) {
    return Results[0].Place.Geometry.Point ?? [0.0, 0.0];
  }

  // Otherwise point to Null Island (https://en.wikipedia.org/wiki/Null_Island)
  return [0.0, 0.0];
}
