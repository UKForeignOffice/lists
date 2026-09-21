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
      "The Bahamas",
      "The Gambia",
      "Naoero",
      "Sint Maarten",
      "Bonaire, Sint Eustatius and Saba",
    ];
    const expectedCountryCodes = ["ITA", "CHN", "COG", "COD", "BRN", "BHS", "GMB", "NRU", "SXM", "BES"];

    // then
    const returnedCountryCodes = testCountryNames.map((country) =>
      getCountryCodeFromCountryName(country)
    );

    expect(returnedCountryCodes).toEqual(expectedCountryCodes);
  });
});
