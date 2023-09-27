import { makeAddressGeoLocationString } from "../geoHelpers";

test("makeAddressGeoLocationString can construct a string from DeserialisedFormData", () => {
  const addressWithAllLines = {
    "address.firstLine": "70 King Charles Street",
    "address.secondLine": "line 2",
    city: "London",
    postCode: "SW1A 2AH",
    addressCountry: "Spain",
  };

  // @ts-ignore
  expect(makeAddressGeoLocationString(addressWithAllLines)).toEqual(
    "70 King Charles Street, line 2, London, Spain, SW1A 2AH"
  );

  const { ["address.secondLine"]: secondLine, ...addressWithNoSecondLine } = {
    ...addressWithAllLines,
  };
  // @ts-ignore
  expect(makeAddressGeoLocationString(addressWithNoSecondLine)).toEqual(
    "70 King Charles Street, London, Spain, SW1A 2AH"
  );

  const { addressCountry, ...addressWithNoAddressCountry } = addressWithAllLines;
  const addressWithCountry = {
    ...addressWithNoAddressCountry,
    country: "United Kingdom",
  };

  // @ts-ignore
  expect(makeAddressGeoLocationString(addressWithCountry)).toEqual(
    "70 King Charles Street, line 2, London, United Kingdom, SW1A 2AH"
  );

  const addressWithWhitespace = {
    "address.firstLine": "                             70 King Charles Street",
    "address.secondLine": "                  line 2",
    city: "   London                         ",
    postCode: "                SW1A 2AH  ",
    addressCountry: " Spain                          ",
  };

  expect(makeAddressGeoLocationString(addressWithWhitespace)).toEqual(
    "70 King Charles Street, line 2, London, Spain, SW1A 2AH"
  );
});
