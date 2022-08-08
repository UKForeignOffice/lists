import getCountryCodeFromCountryName from "../country-codes";

describe("getCountryCodeFromCountryName()", () => {
  it("returns the correct country codes based on country name", () => {
    // when
    const testCountryNames = [
      "italy",
      "china",
      "CONGO",
      "Congo, Democratic Republic",
      "Brunei",
    ];
    const expectedCountryCodes = ["ITA", "CHN", "COG", "COD", "BRN"];

    // then
    const returnedCountryCodes = testCountryNames.map((country) =>
      getCountryCodeFromCountryName(country)
    );

    expect(returnedCountryCodes).toEqual(expectedCountryCodes);
  });
});
