import {
  countriesList,
  fcdoFuneralDirectorsByCountry,
  fcdoLawyersPagesByCountry,
  fcdoTranslatorsInterpretersByCountry,
  languages,
} from "../metadata";

describe("country metadata", () => {
  it("uses the stakeholder country names and codes", () => {
    expect(countriesList).toEqual(
      expect.arrayContaining([
        { text: "The Bahamas", value: "The Bahamas", code: "BHS" },
        { text: "Naoero", value: "Naoero", code: "NRU" },
        {
          text: "Bonaire, Sint Eustatius and Saba",
          value: "Bonaire, Sint Eustatius and Saba",
          code: "BES",
        },
        { text: "The Gambia", value: "The Gambia", code: "GMB" },
        { text: "Sint Maarten", value: "Sint Maarten", code: "SXM" },
      ])
    );
    expect(countriesList.map(({ text }) => text)).not.toContain("Bahamas");
    expect(countriesList.map(({ text }) => text)).not.toContain("Nauru");
    expect(countriesList.map(({ value }) => value)).not.toContain("Bonaire,  Sint Eustatius and Saba");
  });

  it("places Sint Maarten between Singapore and Slovakia", () => {
    const names = countriesList.map(({ text }) => text);
    expect(names.indexOf("Sint Maarten")).toBe(names.indexOf("Singapore") + 1);
    expect(names.indexOf("Slovakia")).toBe(names.indexOf("Sint Maarten") + 1);
  });

  it("uses Nauru for language code na", () => {
    expect(languages.na).toBe("Nauru");
  });

  it("renames Bahamas redirect keys without changing their URLs", () => {
    expect(Object.prototype.hasOwnProperty.call(fcdoLawyersPagesByCountry, "Bahamas")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(fcdoFuneralDirectorsByCountry, "Bahamas")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(fcdoTranslatorsInterpretersByCountry, "Bahamas")).toBe(false);
    expect(fcdoLawyersPagesByCountry["The Bahamas"]).toBe(
      "https://www.gov.uk/government/publications/bahamas-list-of-lawyers"
    );
    expect(fcdoFuneralDirectorsByCountry["The Bahamas"]).toBe(
      "https://www.gov.uk/government/publications/list-of-funeral-directors-in-bahamas"
    );
  });
});
