import { findUserLists, findListById, findListByCountryAndType, createList, updateList } from "../list";
import { prisma } from "../db/__mocks__/prisma-client";
import { logger } from "server/services/logger";
import { ServiceType } from "../types";
import { compact } from "lodash";

jest.mock("../db/prisma-client");
jest.mock("server/services/logger");

describe("List Model:", () => {
  const sampleList: any = {
    id: 1,
    reference: "123Reference",
    createdAt: "2021-06-23T11:13:55.236+00:00",
    updatedAt: "2021-06-23T11:13:55.238+00:00",
    type: "covidTestProviders",
    countryId: 3,
    country: {
      name: "United Kingdom",
    },
    jsonData: {
      createdBy: "test@gov.uk",
      publishers: ["test@gov.uk"],
      validators: ["test@gov.uk"],
      administrators: ["test@gov.uk"],
    },
  };

  describe("findUserLists", () => {
    test("query is correct", async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([sampleList]);

      await findUserLists("test@gov.uk");

      const expectedQuery = `
        SELECT *,
        (
          SELECT ROW_TO_JSON(c)
          FROM (
            SELECT name
            FROM "Country"
            WHERE "List"."countryId" = "Country"."id"
          ) as c
        ) as country
        FROM public."List"
        WHERE "jsonData"->'validators' @> '"test@gov.uk"'
        OR "jsonData"->'publishers' @> '"test@gov.uk"'
        OR "jsonData"->'administrators' @> '"test@gov.uk"'
        ORDER BY id ASC
      `.replace(/\s\s+/g, " ");

      const query = (prisma.$queryRawUnsafe.mock.calls[0][0] as string).replace(/\s\s+/g, " ");

      expect(query).toEqual(expectedQuery);
    });

    test("returned value is correct", async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([sampleList]);

      const result = await findUserLists("test@gov.uk");

      expect(result).toMatchObject([sampleList]);
    });

    test("it returns undefined when queryRawUnsafe fails", async () => {
      prisma.$queryRawUnsafe.mockRejectedValue({ message: "queryRaw error message" });

      const result = await findUserLists("test@gov.uk");

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith("findUserLists Error: queryRaw error message");
    });
  });

  describe("findListById", () => {
    test("findUnique call is correct", async () => {
      prisma.list.findUnique.mockResolvedValue(sampleList);

      await findListById(1);

      expect(prisma.list.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          country: true,
        },
      });
    });

    test("returned value is correct", async () => {
      prisma.list.findUnique.mockResolvedValue(sampleList);

      const result = await findListById(1);

      expect(result).toBe(sampleList);
    });

    test("it returns undefined when findUnique call fails", async () => {
      prisma.list.findUnique.mockRejectedValue({
        message: "findUnique error message",
      });

      const result = await findListById(1);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith("findListById Error: findUnique error message");
    });
  });

  describe("findListByCountryAndType", () => {
    test("findMany call is correct", async () => {
      prisma.list.findMany.mockResolvedValue([sampleList]);

      await findListByCountryAndType("United Kingdom", ServiceType.covidTestProviders);

      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: {
          country: {
            name: "United Kingdom",
          },
          type: ServiceType.covidTestProviders,
        },
        include: {
          country: true,
        },
      });
    });

    test("returned value is correct", async () => {
      prisma.list.findMany.mockResolvedValue([sampleList]);

      const result = await findListByCountryAndType("United Kingdom", ServiceType.covidTestProviders);

      expect(result).toMatchObject([sampleList]);
    });

    test("it returns undefined when findUnique call fails", async () => {
      prisma.list.findMany.mockRejectedValue({
        message: "findMany error message",
      });

      const result = await findListByCountryAndType("United Kingdom", ServiceType.covidTestProviders);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith("findListByCountryAndType Error: findMany error message");
    });
  });

  describe("createList", () => {
    const listData: any = {
      country: "United Kingdom",
      serviceType: ServiceType.covidTestProviders,
      validators: ["test@gov.uk", "validator@gov.uk", undefined],
      publishers: ["test@gov.uk", "publisher@gov.uk", undefined],
      administrators: ["test@gov.uk", "admin@gov.uk", undefined],
      createdBy: "test@gov.uk",
    };

    test("create call is correct", async () => {
      prisma.list.create.mockResolvedValue(sampleList);

      await createList(listData);

      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          type: listData.serviceType,
          country: {
            connectOrCreate: {
              where: {
                name: listData.country,
              },
              create: {
                name: listData.country,
              },
            },
          },
          jsonData: {
            validators: compact(listData.validators),
            publishers: compact(listData.publishers),
            administrators: compact(listData.administrators),
            createdBy: listData.createdBy,
          },
        },
      });
    });

    test("it throws when prisma create rejects", async () => {
      prisma.list.create.mockRejectedValue({ message: "Create error message" });

      await expect(createList(listData)).rejects.toEqual({
        message: "Create error message",
      });

      expect(logger.error).toHaveBeenCalledWith("createList Error: Create error message");
    });

    test("it throws when validators contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          validators: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Validators contain a non GOV UK email address"));
    });

    test("it throws when publishers contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          publishers: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Publishers contain a non GOV UK email address"));
    });

    test("it throws when administrators contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          administrators: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Administrators contain a non GOV UK email address"));
    });

    test("it throws when createdBy is a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          createdBy: "invalid@email.com",
        })
      ).rejects.toEqual(new Error("CreatedBy is not a valid GOV UK email address"));
    });
  });

  describe("updateList", () => {
    const listId = 1;

    const listData: any = {
      country: "United Kingdom",
      serviceType: ServiceType.covidTestProviders,
      validators: ["test@gov.uk", "validator@gov.uk", undefined],
      publishers: ["test@gov.uk", "publisher@gov.uk", undefined],
      administrators: ["test@gov.uk", "admin@gov.uk", undefined],
      createdBy: "test@gov.uk",
    };

    test("create call is correct", async () => {
      prisma.list.update.mockResolvedValue(sampleList);

      await updateList(listId, listData);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: {
          id: listId,
        },
        data: {
          jsonData: {
            validators: compact(listData.validators),
            publishers: compact(listData.publishers),
            administrators: compact(listData.administrators),
          },
        },
      });
    });

    test("it throws when prisma create rejects", async () => {
      prisma.list.update.mockRejectedValue({ message: "Update error message" });

      await expect(updateList(listId, listData)).rejects.toEqual({
        message: "Update error message",
      });

      expect(logger.error).toHaveBeenCalledWith("updateList Error: Update error message");
    });

    test("it throws when validators contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          validators: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Validators contain a non GOV UK email address"));
    });

    test("it throws when publishers contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          publishers: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Publishers contain a non GOV UK email address"));
    });

    test("it throws when administrators contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          administrators: ["invalid@email.com"],
        })
      ).rejects.toEqual(new Error("Administrators contain a non GOV UK email address"));
    });
  });
});
