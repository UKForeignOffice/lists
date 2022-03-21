import { getChangedAddressFields } from "../helpers";

const databaseAddress = {
  firstLine: "70 King Charles Street",
  secondLine: null,
  postCode: "SW1A 2AH",
  city: "London",
};

test("getChangedAddressFields returns the correct changed fields when line 1 changed", () => {
  const withUpdatedLineOne = {
    ...webhookData.lawyer,
    addressLine1: "King Charles Road",
  };

  expect(
    getChangedAddressFields(withUpdatedLineOne, databaseAddress)
  ).toStrictEqual({
    firstLine: "King Charles Road",
  });
});

test("getChangedAddressFields returns the correct changed fields for lawyers", () => {
  const withUpdatedSecondLineFromNull = {
    ...webhookData.lawyer,
    addressLine2: "updated second line",
  };

  expect(
    getChangedAddressFields(withUpdatedSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const withUpdatedToUndefinedOnSecondLine = {
    ...webhookData.lawyer,
    addressLine2: undefined,
  };

  expect(
    getChangedAddressFields(withUpdatedToUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});

  const withPostCodeChange = {
    ...webhookData.lawyer,
    postcode: "EC2A 4DS",
  };

  expect(getChangedAddressFields(withPostCodeChange, databaseAddress)).toEqual({
    postCode: "EC2A 4DS",
  });

  const withCityChange = { ...webhookData.lawyer, city: "Londinium" };
  expect(getChangedAddressFields(withCityChange, databaseAddress)).toEqual({
    city: "Londinium",
  });

  const updatedAllKeys = {
    ...webhookData.lawyer,
    addressLine1: "King Charles Road",
    addressLine2: "updated second line",
    postcode: "EC2A 4DS",
    city: "Londinium",
  };

  expect(getChangedAddressFields(updatedAllKeys, databaseAddress)).toEqual({
    firstLine: "King Charles Road",
    secondLine: "updated second line",
    postCode: "EC2A 4DS",
    city: "Londinium",
  });

  const withAttemptedCountryChange = {
    ...webhookData.lawyer,
    country: "United Kingdom",
  };

  expect(
    getChangedAddressFields(withAttemptedCountryChange, databaseAddress)
  ).toEqual({});
});

test("getChangedAddressFields returns the correct changed fields for covid test providers", () => {
  const organisationDetails = {
    ...webhookData.covidTestProvider.organisationDetails,
  };
  const withUpdatedLineOne = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine1: "King Charles Road",
    },
  };

  expect(
    getChangedAddressFields(withUpdatedLineOne, databaseAddress)
  ).toStrictEqual({
    firstLine: "King Charles Road",
  });

  const withUpdatedSecondLineFromNull = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine2: "updated second line",
    },
  };

  expect(
    getChangedAddressFields(withUpdatedSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const withUpdatedToUndefinedOnSecondLine = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine2: undefined,
    },
  };

  expect(
    getChangedAddressFields(withUpdatedToUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});

  const withPostCodeChange = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      postcode: "EC2A 4DS",
    },
  };

  expect(getChangedAddressFields(withPostCodeChange, databaseAddress)).toEqual({
    postCode: "EC2A 4DS",
  });

  const withCityChange = {
    ...webhookData.covidTestProvider,

    organisationDetails: {
      ...organisationDetails,
      city: "Londinium",
    },
  };
  expect(getChangedAddressFields(withCityChange, databaseAddress)).toEqual({
    city: "Londinium",
  });

  const updatedAllKeys = {
    ...webhookData.covidTestProvider,

    organisationDetails: {
      ...organisationDetails,
      addressLine1: "King Charles Road",
      addressLine2: "updated second line",
      postcode: "EC2A 4DS",
      city: "Londinium",
    },
  };

  expect(getChangedAddressFields(updatedAllKeys, databaseAddress)).toEqual({
    firstLine: "King Charles Road",
    secondLine: "updated second line",
    postCode: "EC2A 4DS",
    city: "Londinium",
  });

  const withAttemptedCountryChange = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      country: "United Kingdom",
    },
  };

  expect(
    getChangedAddressFields(withAttemptedCountryChange, databaseAddress)
  ).toEqual({});
});
