import { LocationClient, CreatePlaceIndexCommand, ListPlaceIndexesCommand, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";
import { checkIfPlaceIndexExists, createPlaceIndex, geoLocatePlaceByText } from "../location";
import { LOCATION_SERVICE_INDEX_NAME } from "../../config";
import { logger } from "../logger";


jest.mock("@aws-sdk/client-location", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-location");

  const sendMock = jest.fn();

  return {
    ...originalModule,
    LocationClient: jest.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    sendMock,
  };
});

const { sendMock } = require("@aws-sdk/client-location");
const invalidLocations = [
  ["Nowhere", "Neverland"],
  ["InvalidLocation", "InvalidCountry"],
];

describe("Location Service Tests", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  test("checkIfPlaceIndexExists returns true when the place index exists", async () => {
    sendMock.mockResolvedValueOnce({Entries: [{IndexName: LOCATION_SERVICE_INDEX_NAME}]});
    const exists = await checkIfPlaceIndexExists(LOCATION_SERVICE_INDEX_NAME);
    expect(exists).toBe(true);
  });

  test("checkIfPlaceIndexExists returns false when the place index does not exist", async () => {
    sendMock.mockResolvedValueOnce({Entries: []});
    const exists = await checkIfPlaceIndexExists("NonExistentIndex");
    expect(exists).toBe(false);
  });

  test("createPlaceIndex successfully creates a place index", async () => {

    sendMock.mockResolvedValueOnce({Entries: []});
    sendMock.mockResolvedValueOnce({});

    const result = await createPlaceIndex();
    expect(result).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(expect.any(CreatePlaceIndexCommand));
  });

  test("geoLocatePlaceByText correctly locates a place by text", async () => {

    sendMock.mockResolvedValueOnce({ Entries: [{ IndexName: LOCATION_SERVICE_INDEX_NAME }] });
    sendMock.mockResolvedValueOnce({
      Results: [
        {
          Place: {
            Geometry: {
              Point: [100.5240, 13.7510]
            }
          }
        }
      ]
    });

    const location = await geoLocatePlaceByText("Bangkok", "Thailand");
    expect(location).toEqual([100.5240, 13.7510]);
    expect(sendMock).toHaveBeenCalledWith(expect.any(SearchPlaceIndexForTextCommand));
  });

  test.each(invalidLocations)("geoLocatePlaceByText throws error for invalid country code with region %s and country %s", async (region, country) => {
    sendMock.mockResolvedValueOnce({ Entries: [{ IndexName: LOCATION_SERVICE_INDEX_NAME }] });

    await expect(geoLocatePlaceByText(region, country))
      .rejects
      .toThrow(`A country code for ${country} could not be found.`);
  });

})
