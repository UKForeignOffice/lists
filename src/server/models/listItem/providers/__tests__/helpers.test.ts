import { getChangedAddressFields } from "../helpers";

const databaseAddress = {
  firstLine: "70 King Charles Street",
  secondLine: null,
  postCode: "SW1A 2AH",
  city: "London",
};

const organisationDetails = {
  ...webhookData.covidTestProvider.organisationDetails,
};

test("getChangedAddressFields returns the correct changed fields when addressLine1 changed", () => {
  const lawyerUpdate = {
    ...webhookData.lawyer,
    addressLine1: "King Charles Road",
  };

  expect(getChangedAddressFields(lawyerUpdate, databaseAddress)).toStrictEqual({
    firstLine: "King Charles Road",
  });

  const covidUpdate = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine1: "King Charles Road",
    },
  };

  expect(getChangedAddressFields(covidUpdate, databaseAddress)).toStrictEqual({
    firstLine: "King Charles Road",
  });
});

test("getChangedAddressFields returns the correct changed fields when addressLine2 changed", () => {
  const lawyerSecondLineFromNull = {
    ...webhookData.lawyer,
    addressLine2: "updated second line",
  };

  expect(
    getChangedAddressFields(lawyerSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const lawyerUndefinedOnSecondLine = {
    ...webhookData.lawyer,
    addressLine2: undefined,
  };

  expect(
    getChangedAddressFields(lawyerUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});

  const covidSecondLineFromNull = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine2: "updated second line",
    },
  };

  expect(
    getChangedAddressFields(covidSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const covidUndefinedOnSecondLine = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      addressLine2: undefined,
    },
  };

  expect(
    getChangedAddressFields(covidUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});
});

test("getChangedAddressFields returns the correct changed fields when postcode changed", () => {
  const lawyerPostCodeChange = {
    ...webhookData.lawyer,
    postcode: "EC2A 4DS",
  };

  expect(
    getChangedAddressFields(lawyerPostCodeChange, databaseAddress)
  ).toEqual({
    postCode: "EC2A 4DS",
  });

  const covidPostCodeChange = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      postcode: "EC2A 4DS",
    },
  };

  expect(getChangedAddressFields(covidPostCodeChange, databaseAddress)).toEqual(
    {
      postCode: "EC2A 4DS",
    }
  );
});

test("getChangedAddressFields returns the correct changed fields when city changed", () => {
  const lawyerCityChange = { ...webhookData.lawyer, city: "Londinium" };
  expect(getChangedAddressFields(lawyerCityChange, databaseAddress)).toEqual({
    city: "Londinium",
  });

  const covidCityChange = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      city: "Londinium",
    },
  };
  expect(getChangedAddressFields(covidCityChange, databaseAddress)).toEqual({
    city: "Londinium",
  });
});

test("getChangedAddressFields returns the correct changed fields when multiple fields changed", () => {
  const lawyerUpdatedAllKeys = {
    ...webhookData.lawyer,
    addressLine1: "King Charles Road",
    addressLine2: "updated second line",
    postcode: "EC2A 4DS",
    city: "Londinium",
  };

  expect(
    getChangedAddressFields(lawyerUpdatedAllKeys, databaseAddress)
  ).toEqual({
    firstLine: "King Charles Road",
    secondLine: "updated second line",
    postCode: "EC2A 4DS",
    city: "Londinium",
  });

  const covidUpdatedAllKeys = {
    ...webhookData.covidTestProvider,

    organisationDetails: {
      ...organisationDetails,
      addressLine1: "King Charles Road",
      addressLine2: "updated second line",
      postcode: "EC2A 4DS",
      city: "Londinium",
    },
  };

  expect(getChangedAddressFields(covidUpdatedAllKeys, databaseAddress)).toEqual(
    {
      firstLine: "King Charles Road",
      secondLine: "updated second line",
      postCode: "EC2A 4DS",
      city: "Londinium",
    }
  );
});

test("getChangedAddressFields doesn't update country", () => {
  const lawyerAttemptedCountryChange = {
    ...webhookData.lawyer,
    country: "United Kingdom",
  };

  expect(
    getChangedAddressFields(lawyerAttemptedCountryChange, databaseAddress)
  ).toEqual({});

  const covidAttemptedCountryChange = {
    ...webhookData.covidTestProvider,
    organisationDetails: {
      ...organisationDetails,
      country: "United Kingdom",
    },
  };

  expect(
    getChangedAddressFields(covidAttemptedCountryChange, databaseAddress)
  ).toEqual({});
});
