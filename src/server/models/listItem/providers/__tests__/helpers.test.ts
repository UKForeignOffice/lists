import { getChangedAddressFields } from "../helpers";
import { Address } from "server/models/types";

test.only("getChangedAddressFields returns the correct changed fields for lawyers", () => {
  const databaseAddress = {
    firstLine: "70 King Charles Street",
    secondLine: null,
    postCode: "SW1A 2AH",
    city: "London",
  };

  const withUpdatedLineOne = {
    ...webhookData.lawyer,
    addressLine1: "King Charles Road",
  };

  expect(
    getChangedAddressFields(withUpdatedLineOne, databaseAddress)
  ).toStrictEqual({
    firstLine: "King Charles Road",
  });

  const updatedSecondLineFromNull = {
    ...webhookData.lawyer,
    addressLine1: "7 Queen Charles Road",
    addressLine2: "updated second line",
    postCode: "SW1A 2AH",
    city: "London",
  };

  expect(
    getChangedAddressFields(updatedSecondLineFromNull, databaseAddress)
  ).toEqual({
    firstLine: "70 King Charles Street",
    secondLine: "updated second line",
    postCode: "SW1A 2AH",
    city: "London",
  });

  const withPostCodeChange = {
    ...webhookData.lawyer,
    postcode: "EC2A 4DS",
  };
  expect(getChangedAddressFields(withPostCodeChange, databaseAddress)).toEqual({
    firstLine: "70 King Charles Street",
    postCode: "EC2A 4DS",
    city: "London",
  });

  expect(
    getChangedAddressFields(
      { ...webhookData.lawyer, city: "Londinium" },
      databaseAddress
    )
  ).toEqual({
    firstLine: "70 King Charles Street",
    secondLine: null,
    postCode: "EC2A 4DS",
    city: "Londinium",
  });
  expect(1).toBe(3);
});
