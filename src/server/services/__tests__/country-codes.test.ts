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
      "Naoero",
    ];
    const expectedCountryCodes = ["ITA", "CHN", "COG", "COD", "BRN", "BHS", "NRU"];

    // then
    const returnedCountryCodes = testCountryNames.map((country) =>
      getCountryCodeFromCountryName(country)
    );

    expect(returnedCountryCodes).toEqual(expectedCountryCodes);
  });
});
