import * as missingCountries from "../missing-countries";
import { countriesList } from "../../services/metadata";
import { ServiceType } from "../../models/types";
import { prisma } from "../../models/db/__mocks__/prisma-client";
import * as validation from "../../utils/validation";

import type { List } from "../../models/types";

const { addMissingCountriesToService } = missingCountries;
const testServiceType = "lawyers";
const testServiceTypeEnum = ServiceType[testServiceType];

jest.mock("../../models/db/prisma-client");

describe("addMissingCountriesToService", () => {
  it("throws error if an incorrect service type is entered", async () => {
    // when
    const incorrectValues = ["lawyer", "funeral-director", "something"];

    // then
    for (const value of incorrectValues) {
      const fn = async () => await addMissingCountriesToService(value);
      await expect(fn()).rejects.toThrow(
        missingCountries.errorMessages.serviceType
      );
    }
  });

  it("throws error if all countries for a service type have already been added", async () => {
    // when
    getFakeDataFromListTable();

    const fn = async () => await addMissingCountriesToService(testServiceType);

    // then
    await expect(fn()).rejects.toThrow(
      missingCountries.errorMessages.newCountries
    );
  });

  it("adds lists only to countries are missing from the countries list", async () => {
    // when
    preventGOVUKEmailCheck();
    getFakeDataFromListTable(true);

    const totalCountriesMinusRemovedCountries = 78;
    const stubCreateListDBMethod = jest
      .spyOn(prisma.list, "create")
      .mockResolvedValue(createFakeListValue(testServiceTypeEnum));

    await addMissingCountriesToService(testServiceType);

    // then
    expect(stubCreateListDBMethod).toHaveBeenCalledTimes(
      totalCountriesMinusRemovedCountries
    );
  });

  it("adds correct emails to validators, publishers, administrators and createdBy properties", async () => {
    // when
    preventGOVUKEmailCheck();
    getFakeDataFromListTable(true);

    const testEmails = [
      "person1@test.com",
      "person2@test.com",
      "person3@test.com",
    ];
    const exectedFirstArg = {
      type: testServiceType,
      country: {
        connectOrCreate: {
          where: {
            name: "Afghanistan",
          },
          create: {
            name: "Afghanistan",
          },
        },
      },
      jsonData: {
        validators: testEmails,
        publishers: testEmails,
        administrators: testEmails,
        createdBy: testEmails[0],
      },
    };
    const stubCreateListDBMethod = jest
      .spyOn(prisma.list, "create")
      .mockResolvedValue(createFakeListValue(testServiceTypeEnum));

    await addMissingCountriesToService(testServiceType, testEmails);

    // when
    expect(stubCreateListDBMethod).toHaveBeenNthCalledWith(1, {
      data: exectedFirstArg,
    });
  });
});

function createFakeListData(
  serviceType: ServiceType,
  removeSomeCountries?: boolean
) {
  let listData: List[] = [];
  let editableCountryList = [...countriesList];

  if (removeSomeCountries) {
    editableCountryList = countriesList.filter(removeThirdOfCountries);
  }

  for (const country of editableCountryList) {
    listData.push({
      ...createFakeListValue(serviceType),
      country: { name: country.text },
    });
  }
  return listData;
}

function createFakeListValue(serviceType: ServiceType) {
  const testEmail = "test@test.com";
  return {
    id: 1,
    reference: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    type: serviceType,
    countryId: 1,
    jsonData: {
      createdBy: testEmail,
      publishers: [testEmail],
      validators: [testEmail],
      administrators: [testEmail],
    },
  };
}

function removeThirdOfCountries(country, index) {
  if (index % 3 !== 0) return country;
}

function preventGOVUKEmailCheck() {
  jest.spyOn(validation, "isGovUKEmailAddress").mockImplementation(() => true);
}

function getFakeDataFromListTable(removeSomeCountries: boolean = false) {
  prisma.list.findMany.mockResolvedValue(
    createFakeListData(testServiceTypeEnum, removeSomeCountries)
  );
}
