import { Location } from "@aws-sdk/client-location";
import {
  getAWSLocationService,
  checkIfPlaceIndexExists,
  createPlaceIndex,
  geoLocatePlaceByText,
} from "../location";
import { LOCATION_SERVICE_INDEX_NAME, AWS_REGION } from "server/config";
import { logger } from "server/services/logger";

jest.mock("@aws-sdk/client-location", () => {
  return {
    Location: jest.fn(() => ({
      listPlaceIndexes: jest.fn(),
      createPlaceIndex: jest.fn(),
      searchPlaceIndexForText: jest.fn(),
    })),
  };
});

describe("Location service:", () => {
  test("service is initialized with the correct parameters", () => {
    const expectedParams = {
      region: AWS_REGION,
    };

    getAWSLocationService();
    expect(Location).toHaveBeenCalledWith(expectedParams);
  });

  describe("checkIfPlaceIndexExists", () => {
    test("returns true when place index exists", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.listPlaceIndexes as jest.Mock).mockResolvedValue({
        Entries: [{ IndexName: "MOCK_INDEX_NAME" }],
      });

      const exists = await checkIfPlaceIndexExists("MOCK_INDEX_NAME");
      expect(exists).toBe(true);
    });

    test("returns false when place index does not exist", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.listPlaceIndexes as jest.Mock).mockResolvedValue({
        Entries: [],
      });

      const exists = await checkIfPlaceIndexExists("DOES_NOT_EXIST");
      expect(exists).toBe(false);
    });

    test("returns false when listPlaceIndexes rejects", async () => {
      const mockLocationClient = getAWSLocationService();
      const error = new Error("SomeError");
      (mockLocationClient.listPlaceIndexes as jest.Mock).mockRejectedValue(error);

      const exists = await checkIfPlaceIndexExists("DOES_NOT_EXIST");
      expect(exists).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "checkIfPlaceIndexExists Error: SomeError"
      );
    });
  });

  describe("createPlaceIndex", () => {
    test("createPlaceIndex request is correct", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.createPlaceIndex as jest.Mock).mockResolvedValue({});

      const result = await createPlaceIndex();

      expect(result).toBe(true);
      expect(mockLocationClient.createPlaceIndex).toHaveBeenCalledWith({
        DataSource: "Esri",
        DataSourceConfiguration: {
          IntendedUse: "SingleUse",
        },
        Description: "FCDO Professional service finder",
        IndexName: LOCATION_SERVICE_INDEX_NAME,
        PricingPlan: "RequestBasedUsage",
      });
    });

    test("it returns true when place index already exists", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.listPlaceIndexes as jest.Mock).mockResolvedValue({
        Entries: [
          {
            IndexName: LOCATION_SERVICE_INDEX_NAME,
          },
        ],
      });

      const result = await createPlaceIndex();

      expect(result).toBe(true);
    });

    test.skip("it returns false when createPlaceIndex rejects", async () => {
      const mockLocationClient = getAWSLocationService();
      const error = new Error("createPlaceIndex error message");

      (mockLocationClient.createPlaceIndex as jest.Mock).mockRejectedValue(error);

      const result = await createPlaceIndex();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "createPlaceIndex error: createPlaceIndex error message"
      );
    });

  });

  describe("geoLocatePlaceByText", () => {
    test("locatePlaceByText request is correct", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.searchPlaceIndexForText as jest.Mock).mockResolvedValue({
        Results: [{ Place: { Geometry: { Point: [100.50483000000008, 13.753360000000043] } } }],
      });

      await geoLocatePlaceByText("Bangkok", "Thailand");

      expect(mockLocationClient.searchPlaceIndexForText).toHaveBeenCalledWith({
        MaxResults: 1,
        Text: "Bangkok",
        IndexName: LOCATION_SERVICE_INDEX_NAME,
        FilterCountries: ["THA"],
      });
    });

    test("locatePlaceByText response is correct", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.searchPlaceIndexForText as jest.Mock).mockResolvedValue({
        Results: [{ Place: { Geometry: { Point: [100.50483000000008, 13.753360000000043] } } }],
      });

      const result = await geoLocatePlaceByText("Bangkok", "Thailand");

      expect(result[0].Place.Geometry.Point).toEqual([100.50483000000008, 13.753360000000043]);
    });

    test("returns 0.0, 0.0 when searchPlaceIndexForText returns no results", async () => {
      const mockLocationClient = getAWSLocationService();
      (mockLocationClient.searchPlaceIndexForText as jest.Mock).mockResolvedValue({
        Results: [],
      });

      const result = await geoLocatePlaceByText("Bangkok", "Thailand");

      expect(result).toEqual([0.0, 0.0]);
    });
  });

});
