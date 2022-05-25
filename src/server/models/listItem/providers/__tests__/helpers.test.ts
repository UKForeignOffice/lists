import { getChangedAddressFields } from "../helpers";

const databaseAddress = {
  firstLine: "70 King Charles Street",
  secondLine: null,
  postCode: "SW1A 2AH",
  city: "London",
};

test("getChangedAddressFields returns the correct changed fields when addressLine1 changed", () => {
  const lawyerUpdate = {
    ...webhookData.lawyer,
    ["address.firstLine"]: "King Charles Road",
  };

  expect(getChangedAddressFields(lawyerUpdate, databaseAddress)).toStrictEqual({
    firstLine: "King Charles Road",
  });

  const covidUpdate = {
    ...webhookData.covidTestProvider,
    ["address.firstLine"]: "King Charles Road",
  };

  expect(getChangedAddressFields(covidUpdate, databaseAddress)).toStrictEqual({
    firstLine: "King Charles Road",
  });
});

test("getChangedAddressFields returns the correct changed fields when addressLine2 changed", () => {
  const lawyerSecondLineFromNull = {
    ...webhookData.lawyer,
    ["address.secondLine"]: "updated second line",
  };

  expect(
    getChangedAddressFields(lawyerSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const lawyerUndefinedOnSecondLine = {
    ...webhookData.lawyer,
    ["address.secondLine"]: undefined,
  };

  expect(
    getChangedAddressFields(lawyerUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});

  const covidSecondLineFromNull = {
    ...webhookData.covidTestProvider,
    ["address.secondLine"]: "updated second line",
  };

  expect(
    getChangedAddressFields(covidSecondLineFromNull, databaseAddress)
  ).toEqual({
    secondLine: "updated second line",
  });

  const covidUndefinedOnSecondLine = {
    ...webhookData.covidTestProvider,
    ["address.secondLine"]: undefined,
  };

  expect(
    getChangedAddressFields(covidUndefinedOnSecondLine, databaseAddress)
  ).toEqual({});
});

test("getChangedAddressFields returns the correct changed fields when postcode changed", () => {
  const lawyerPostCodeChange = {
    ...webhookData.lawyer,
    postCode: "EC2A 4DS",
  };

  expect(
    getChangedAddressFields(lawyerPostCodeChange, databaseAddress)
  ).toEqual({
    postCode: "EC2A 4DS",
  });

  const covidPostCodeChange = {
    ...webhookData.covidTestProvider,
    postCode: "EC2A 4DS",
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
    city: "Londinium",
  };
  expect(getChangedAddressFields(covidCityChange, databaseAddress)).toEqual({
    city: "Londinium",
  });
});

test("getChangedAddressFields returns the correct changed fields when multiple fields changed", () => {
  const lawyerUpdatedAllKeys = {
    ...webhookData.lawyer,
    ["address.firstLine"]: "King Charles Road",
    ["address.secondLine"]: "updated second line",
    postCode: "EC2A 4DS",
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
    ["address.firstLine"]: "King Charles Road",
    ["address.secondLine"]: "updated second line",
    postCode: "EC2A 4DS",
    city: "Londinium",
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
    country: "United Kingdom",
  };

  expect(
    getChangedAddressFields(covidAttemptedCountryChange, databaseAddress)
  ).toEqual({});
});
