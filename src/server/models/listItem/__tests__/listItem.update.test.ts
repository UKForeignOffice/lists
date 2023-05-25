import * as location from "../../../../server/services/location";
import * as listItem from "./../listItem";
import { prisma } from "../../../models/db/__mocks__/prisma-client";

jest.mock("./../../../models/db/prisma-client");

test("throws when the requested id does not exist", async () => {
  // @ts-expect-error
  prisma.listItem.findFirst.mockRejectedValue(Error("mocked error"));

  await expect(listItem.update(40404, 1, webhookData.lawyer)).rejects.toThrow(
    "list item 40404 not found"
  );
  await expect(
    listItem.update(40404, 1, webhookData.covidTestProvider)
  ).rejects.toThrow("list item 40404 not found");
});

test.skip("update throws when geoLocatePlaceByText fails", async () => {
  jest
    .spyOn(location, "geoLocatePlaceByText")
    .mockRejectedValue(Error("nope!"));

  // @ts-expect-error
  prisma.listItem.findFirst.mockResolvedValue({
    address: {
      firstLine: "address",
      secondLine: "should",
      postCode: "change",
      city: "London",
    },
  });

  await expect(listItem.update(1, 1, webhookData.lawyer)).rejects.toThrowError(
    "GeoLocation update failed"
  );
});

test.skip("address and geolocation tables are not queried when there are no address changes", async () => {
  jest.spyOn(location, "geoLocatePlaceByText").mockResolvedValue([1, 2]);

  // @ts-expect-error
  prisma.listItem.findFirst.mockResolvedValue({
    address: {
      firstLine: "70 King Charles Street",
      secondLine: null,
      postCode: "SW1A 2AH",
      city: "London",
    },
  });
  // @ts-expect-error
  jest.spyOn(prisma.listItem, "update").mockResolvedValue({});

  await listItem.update(1, 1, webhookData.lawyer);
  expect(prisma.listItem.update).toBeCalled();
  expect(prisma.address.update).not.toBeCalled();
  expect(prisma.$queryRaw).not.toBeCalled();
});

test.skip("address and geolocation is updated when there are address changes", async () => {
  jest.spyOn(location, "geoLocatePlaceByText").mockResolvedValue([1, 2]);

  // @ts-expect-error
  prisma.listItem.findFirst.mockResolvedValue({
    address: {
      id: 101,
      firstLine: "Change me",
      secondLine: "change it please",
      postCode: "404-L4ND",
      city: "London",
    },
  });

  const updatedData = {
    ...webhookData.lawyer,
    addressLine1: "70 King Charles Street",
    addressLine2: undefined,
    postcode: "SW1A 2AH",
  };

  jest.spyOn(prisma, "$transaction").mockResolvedValue([{}]);
  await listItem.update(1, 1, updatedData);
  expect(prisma.listItem.update).toHaveBeenCalledWith({
    where: {
      id: 1,
    },
    data: {
      jsonData: updatedData,
    },
  });
  expect(prisma.address.update).toBeCalledWith({
    where: {
      id: 101,
    },
    data: {
      firstLine: "70 King Charles Street",
      postCode: "SW1A 2AH",
    },
  });
  expect(prisma.$queryRaw).toBeCalled();
});

test.skip("throws when any query in transaction fails", async () => {
  jest.spyOn(location, "geoLocatePlaceByText").mockResolvedValue([1, 2]);

  // @ts-expect-error
  prisma.listItem.findFirst.mockResolvedValue({
    address: {
      id: 101,
      firstLine: "Change me",
      secondLine: "change it please",
      postCode: "404-L4ND",
      city: "London",
    },
  });

  const updatedData = {
    ...webhookData.lawyer,
    addressLine1: "70 King Charles Street",
    addressLine2: undefined,
    postcode: "SW1A 2AH",
  };

  const update = listItem.update(1, 1, updatedData);
  await expect(update).rejects.toThrow("listItem.update prisma update failed");
});
