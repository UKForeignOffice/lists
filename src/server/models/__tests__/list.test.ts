import {
  findUserLists,
  findListById,
  findListByCountryAndType,
  createList,
  updateList,
} from "../list";
import { prisma } from "../db/prisma-client";
import { logger } from "server/services/logger";
import { ServiceType } from "../types";
import { compact } from "lodash";

jest.mock("server/services/logger");

describe("List Model:", () => {
  const sampleList = {
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

  function spyQueryRaw(
    returnValue: any = [sampleList],
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma, "$queryRaw");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  function spyListFindUnique(
    returnValue: any = sampleList,
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma.list, "findUnique");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  function spyListFindMany(
    returnValue: any = [sampleList],
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma.list, "findMany");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  function spyListCreate(
    returnValue: any = sampleList,
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma.list, "create");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  function spyListUpdate(
    returnValue: any = sampleList,
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma.list, "update");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  describe("findUserLists", () => {
    test("query is correct", async () => {
      const spy = spyQueryRaw();

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

      const query = spy.mock.calls[0][0].replace(/\s\s+/g, " ");

      expect(query).toEqual(expectedQuery);
    });

    test("returned value is correct", async () => {
      spyQueryRaw();

      const result = await findUserLists("test@gov.uk");

      expect(result).toMatchObject([sampleList]);
    });

    test("it returns undefined when queryRaw fails", async () => {
      spyQueryRaw({ message: "queryRaw error message" }, true);

      const result = await findUserLists("test@gov.uk");

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        "findUserLists Error: queryRaw error message"
      );
    });
  });

  describe("findListById", () => {
    test("findUnique call is correct", async () => {
      const spy = spyListFindUnique();

      await findListById(1);

      expect(spy).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          country: true,
        },
      });
    });

    test("returned value is correct", async () => {
      spyListFindUnique();

      const result = await findListById(1);

      expect(result).toBe(sampleList);
    });

    test("it returns undefined when findUnique call fails", async () => {
      spyListFindUnique({ message: "findUnique error message" }, true);

      const result = await findListById(1);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        "findListById Error: findUnique error message"
      );
    });
  });

  describe("findListByCountryAndType", () => {
    test("findMany call is correct", async () => {
      const spy = spyListFindMany();

      await findListByCountryAndType(
        "United Kingdom",
        ServiceType.covidTestProviders
      );

      expect(spy).toHaveBeenCalledWith({
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
      spyListFindMany();

      const result = await findListByCountryAndType(
        "United Kingdom",
        ServiceType.covidTestProviders
      );

      expect(result).toMatchObject([sampleList]);
    });

    test("it returns undefined when findUnique call fails", async () => {
      spyListFindMany({ message: "findMany error message" }, true);

      const result = await findListByCountryAndType(
        "United Kingdom",
        ServiceType.covidTestProviders
      );

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        "findListByCountryAndType Error: findMany error message"
      );
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
      const spy = spyListCreate();

      await createList(listData);

      expect(spy).toHaveBeenCalledWith({
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
      spyListCreate({ message: "Create error message" }, true);

      await expect(createList(listData)).rejects.toEqual({
        message: "Create error message",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "createList Error: Create error message"
      );
    });

    test("it throws when validators contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          validators: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Validators contain a non GOV UK email address")
      );
    });

    test("it throws when publishers contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          publishers: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Publishers contain a non GOV UK email address")
      );
    });

    test("it throws when administrators contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          administrators: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Administrators contain a non GOV UK email address")
      );
    });

    test("it throws when createdBy is a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          createdBy: "invalid@email.com",
        })
      ).rejects.toEqual(
        new Error("CreatedBy is not a valid GOV UK email address")
      );
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
      const spy = spyListUpdate();

      await updateList(listId, listData);

      expect(spy).toHaveBeenCalledWith({
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
      spyListUpdate({ message: "Update error message" }, true);

      await expect(updateList(listId, listData)).rejects.toEqual({
        message: "Update error message",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "updateList Error: Update error message"
      );
    });

    test("it throws when validators contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          validators: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Validators contain a non GOV UK email address")
      );
    });

    test("it throws when publishers contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          publishers: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Publishers contain a non GOV UK email address")
      );
    });

    test("it throws when administrators contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          administrators: ["invalid@email.com"],
        })
      ).rejects.toEqual(
        new Error("Administrators contain a non GOV UK email address")
      );
    });
  });
});
