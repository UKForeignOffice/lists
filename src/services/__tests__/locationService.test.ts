import { Location } from "aws-sdk";
import {
  getAWSLocationService,
  checkIfPlaceIndexExists,
  createPlaceIndex,
  locatePlaceByText,
} from "../locationService";

describe("Location service:", () => {
  test("service is initialized with the correct parameters", () => {
    const expectedParams = {
      apiVersion: "2020-11-19",
      region: "us-east-1",
    };

    getAWSLocationService();
    expect(Location).toHaveBeenCalledWith(expectedParams);
  })


  test("expect credentials to be set correctly", () => {
    const location = getAWSLocationService();
    expect(location.config.credentials).toEqual({
      accessKeyId: "LOCATION_SERVICE_ACCESS_KEY",
      secretAccessKey: "LOCATION_SERVICE_SECRET_KEY",
    });
  });

  test("checkIfPlaceIndexExists returns true when place index exists", async () => {
    // place index is mocked see ../__mocks__
    const exists = await checkIfPlaceIndexExists("MOCK_INDEX_NAME")
    expect(exists).toBe(true);
  });


  test("checkIfPlaceIndexExists returns false when place index does not exist", async () => {
    const exists = await checkIfPlaceIndexExists("DOES_NOT_EXIST");
    expect(exists).toBe(false);
  });

  test("createLocationPlacesIndex request is correct", async () => {
    const location = getAWSLocationService();
    const result = await createPlaceIndex();
    expect(result).toBe(true)
    expect(location.createPlaceIndex).toHaveBeenCalledWith({
      DataSource: "Esri",
      DataSourceConfiguration: {
        IntendedUse: "SingleUse",
      },
      Description: "FCDO Professional service finder",
      IndexName: "LOCATION_SERVICE_INDEX_NAME",
      PricingPlan: "RequestBasedUsage",
    });
  });

  test("locatePlaceByText request is correct", async () => {
    const location = getAWSLocationService();
    await locatePlaceByText("Bangkok, Thailand");
    
    expect(location.searchPlaceIndexForText).toHaveBeenCalledWith({
      MaxResults: 1,
      Text: "Bangkok, Thailand",
      IndexName: "LOCATION_SERVICE_INDEX_NAME",
    });
  });

  test("locatePlaceByText response is correct", async () => {
    const result = await locatePlaceByText("Bangkok, Thailand");

    expect(result).toEqual({
      Country: "THA",
      Geometry: { Point: [100.50483000000008, 13.753360000000043] },
      Label: "Bangkok, Phra Nakhon, Bangkok, THA",
      Region: "Bangkok",
      SubRegion: "Phra Nakhon",
    });
  });

})