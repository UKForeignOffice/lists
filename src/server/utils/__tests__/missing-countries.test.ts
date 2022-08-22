import * as missingCountries from "../missing-countries";
import { countriesList } from "../../services/metadata";
import { ServiceType } from "../../models/types";
import { prisma } from "../../models/db/__mocks__/prisma-client";
import * as validation from "../../utils/validation";

import type { List, Country } from "../../models/types";

const { addMissingCountriesToService } = missingCountries;
const testServiceType = "lawyers";
const testServiceTypeEnum = ServiceType[testServiceType];
const fakeDataTestEmail = "test@createfake.com";

let stubCreateListDBMethod;

jest.mock("../../models/db/prisma-client");

beforeEach(() => {
  preventGOVUKEmailCheck();

  stubCreateListDBMethod = jest
    .spyOn(prisma.list, "create")
    .mockResolvedValue(createFakeListValue(testServiceTypeEnum));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe.only("addMissingCountriesToService()", () => {
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
    mockFindManyFromListTable();

    const fn = async () => await addMissingCountriesToService(testServiceType);

    // then
    await expect(fn()).rejects.toThrow(
      missingCountries.errorMessages.newCountries
    );
  });

  it("adds lists only to countries are missing from the countries list", async () => {
    // when
    mockFindManyFromListTable(true);

    const totalCountriesMinusRemovedCountries = 78;

    await addMissingCountriesToService(testServiceType);

    // then
    expect(stubCreateListDBMethod).toHaveBeenCalledTimes(
      totalCountriesMinusRemovedCountries
    );
  });

  it("adds correct emails to validators, publishers, administrators and createdBy properties", async () => {
    // when
    mockFindManyFromListTable(true);

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

    await addMissingCountriesToService(testServiceType, testEmails);

    // then
    expect(stubCreateListDBMethod).toHaveBeenNthCalledWith(1, {
      data: exectedFirstArg,
    });
  });

  it("gets emails from existing list if service name passed in as email argument", async () => {
    // when
    mockFindFirstFromListTable();
    mockFindManyFromListTable(true);

    const testCreatedBy = ["lawyers"];
    const emailsFromFakeDataCreation = {
      validators: [fakeDataTestEmail],
      publishers: [fakeDataTestEmail],
      administrators: [fakeDataTestEmail],
      createdBy: fakeDataTestEmail,
    };
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
      jsonData: emailsFromFakeDataCreation,
    };

    await addMissingCountriesToService(testServiceType, testCreatedBy);

    // then
    expect(stubCreateListDBMethod).toHaveBeenNthCalledWith(1, {
      data: exectedFirstArg,
    });
  });

  it("gets emails from existing list of specific country if service type and country added as email argument", async () => {
    // when
    mockFindFirstFromListTable();
    mockFindFirstFromCountryTable();
    mockFindManyFromListTable(true);

    const testCreatedBy = ["lawyers", "afghanistan"];
    const emailsFromFakeDataCreation = {
      validators: [fakeDataTestEmail],
      publishers: [fakeDataTestEmail],
      administrators: [fakeDataTestEmail],
      createdBy: fakeDataTestEmail,
    };
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
      jsonData: emailsFromFakeDataCreation,
    };

    await addMissingCountriesToService(testServiceType, testCreatedBy);

    // then
    expect(stubCreateListDBMethod).toHaveBeenNthCalledWith(1, {
      data: exectedFirstArg,
    });
  });

  it.only("throws an error if list to copy emails from could not be found", async () => {
    // when
    mockFindManyFromListTable(true);

    const testCreatedBy = ["funeralDirectors"];
    const fn = async () =>
      await addMissingCountriesToService(testServiceType, testCreatedBy);

    // then
    await expect(fn()).rejects.toThrow(
      missingCountries.errorMessages.missingList(testCreatedBy[0])
    );
  });
});

type CreateFakeDataOptions = {
  serviceType: ServiceType;
  removeSomeCountries?: boolean;
  returnSingleList?: boolean;
};

function createFakeListData({
  serviceType,
  removeSomeCountries = false,
  returnSingleList = false,
}: CreateFakeDataOptions) {
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
  return returnSingleList ? listData[0] : listData;
}

function createFakeListValue(serviceType: ServiceType) {
  return {
    id: 1,
    reference: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
    type: serviceType,
    countryId: 1,
    jsonData: {
      createdBy: fakeDataTestEmail,
      publishers: [fakeDataTestEmail],
      validators: [fakeDataTestEmail],
      administrators: [fakeDataTestEmail],
    },
  };
}

function removeThirdOfCountries(country, index) {
  if (index % 3 !== 0) return country;
}

function preventGOVUKEmailCheck() {
  jest.spyOn(validation, "isGovUKEmailAddress").mockImplementation(() => true);
}

function mockFindManyFromListTable(removeSomeCountries: boolean = false) {
  prisma.list.findMany.mockResolvedValue(
    createFakeListData({
      serviceType: testServiceTypeEnum,
      removeSomeCountries,
    }) as List[]
  );
}

function mockFindFirstFromListTable(returnNull: boolean = false) {
  prisma.list.findFirst.mockResolvedValue(
    createFakeListData({
      serviceType: testServiceTypeEnum,
      returnSingleList: true,
    }) as List
  );
}
function mockFindFirstFromCountryTable() {
  prisma.country.findFirst.mockResolvedValue({
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "Afghanistan",
  } as Country);
}
