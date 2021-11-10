import { Location } from "aws-sdk";
import {
  getAWSLocationService,
  checkIfPlaceIndexExists,
  createPlaceIndex,
  geoLocatePlaceByText,
} from "../location";
import { LOCATION_SERVICE_INDEX_NAME } from "server/config";
import { logger } from "server/services/logger";

describe("Location service:", () => {
  test("service is initialized with the correct parameters", () => {
    const expectedParams = {
      apiVersion: "2020-11-19",
      region: "eu-west-1",
    };

    getAWSLocationService();
    expect(Location).toHaveBeenCalledWith(expectedParams);
  });

  describe("checkIfPlaceIndexExists", () => {
    test("returns true when place index exists", async () => {
      // place index is mocked see ../__mocks__
      const exists = await checkIfPlaceIndexExists("MOCK_INDEX_NAME");
      expect(exists).toBe(true);
    });

    test("returns false when place index does not exist", async () => {
      const exists = await checkIfPlaceIndexExists("DOES_NOT_EXIST");
      expect(exists).toBe(false);
    });

    test("returns false when listPlaceIndexes rejects", async () => {
      const error: any = new Error("SomeError");
      jest
        .spyOn(getAWSLocationService().listPlaceIndexes(), "promise")
        .mockRejectedValue(error);

      const exists = await checkIfPlaceIndexExists("DOES_NOT_EXIST");

      expect(exists).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "checkIfPlaceIndexExists Error: SomeError"
      );
    });
  });

  describe("createPlaceIndex", () => {
    test("createLocationPlacesIndex request is correct", async () => {
      const location = getAWSLocationService();

      const result = await createPlaceIndex();

      expect(result).toBe(true);
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

    test("it returns true when secret already exists", async () => {
      const placeIndexes: any = {
        Entries: [
          {
            CreateTime: "2021-03-22T16:25:58.695Z",
            DataSource: "Esri",
            Description: "MOCK_INDEX_DESCRIPTION",
            IndexName: LOCATION_SERVICE_INDEX_NAME,
            UpdateTime: "2021-03-22T16:25:58.695Z",
          },
        ],
      };

      jest
        .spyOn(getAWSLocationService(), "listPlaceIndexes")
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(placeIndexes),
        } as any);

      const result = await createPlaceIndex();

      expect(result).toBe(true);
    });

    test("it returns false when createPlaceIndex rejects", async () => {
      const error = new Error("listPlaceIndexes error message");

      jest
        .spyOn(getAWSLocationService(), "createPlaceIndex")
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValue(error),
        } as any);

      const result = await createPlaceIndex();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "createPlaceIndex error: listPlaceIndexes error message"
      );
    });
  });

  describe("geoLocatePlaceByText", () => {
    test("locatePlaceByText request is correct", async () => {
      const location = getAWSLocationService();
      await geoLocatePlaceByText("Bangkok, Thailand");

      expect(location.searchPlaceIndexForText).toHaveBeenCalledWith({
        MaxResults: 1,
        Text: "Bangkok, Thailand",
        IndexName: "LOCATION_SERVICE_INDEX_NAME",
      });
    });

    test("locatePlaceByText response is correct", async () => {
      const result = await geoLocatePlaceByText("Bangkok, Thailand");

      expect(result).toEqual([100.50483000000008, 13.753360000000043]);
    });

    test("returns 0.0, 0.0 when searchPlaceIndexForText returns no results", async () => {
      jest
        .spyOn(getAWSLocationService(), "searchPlaceIndexForText")
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce({
            Results: [],
          }),
        } as any);

      const result = await geoLocatePlaceByText("Bangkok, Thailand");

      expect(result).toEqual([0.0, 0.0]);
    });
  });
});
