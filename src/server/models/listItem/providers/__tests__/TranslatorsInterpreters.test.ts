import * as locationService from "../../../../services/location";
import { prisma } from "../../../db/__mocks__/prisma-client";
import { findPublishedTranslatorsInterpretersPerCountry } from "../TranslatorsInterpreters";

jest.mock("../../../db/prisma-client");

describe("findPublishedTranslatorsInterpretersPerCountry", () => {
  const mockGeoLocatePlaceByText = (): jest.SpyInstance => {
    return jest.spyOn(locationService, "geoLocatePlaceByText").mockResolvedValue([1, 1]);
  };

  test.each([
    ["Bonaire, Sint Eustatius and Saba", "Kralendijk"],
    ["Timor-Leste", "Dili"],
  ])("passes the canonical country name unchanged to geolocation for %s", async (countryName, region) => {
    const spyGeoLocatePlaceByText = mockGeoLocatePlaceByText();
    jest.spyOn(prisma, "$queryRawUnsafe").mockResolvedValue([]);

    await findPublishedTranslatorsInterpretersPerCountry({
      countryName,
      region,
      servicesProvided: [],
      offset: 0,
    });

    expect(spyGeoLocatePlaceByText).toHaveBeenCalledWith(region, countryName);
  });

  test("uses the canonical Bonaire country name in SQL and returns published rows", async () => {
    mockGeoLocatePlaceByText();
    const publishedRows = [{ id: "published-row" }];
    const spyQueryRaw = jest.spyOn(prisma, "$queryRawUnsafe").mockResolvedValue(publishedRows);

    const result = await findPublishedTranslatorsInterpretersPerCountry({
      countryName: "Bonaire, Sint Eustatius and Saba",
      region: "Kralendijk",
      servicesProvided: [],
      offset: 0,
    });

    const query = spyQueryRaw.mock.calls[0][0] as string;
    expect(query).toContain(`AND lower("Country".name) = 'bonaire, sint eustatius and saba'`);
    expect(result).toEqual(publishedRows);
  });
});
