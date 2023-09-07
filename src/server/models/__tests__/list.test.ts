import { findListById, findListByCountryAndType, createList, updateList, getRelatedLinks } from "../list";
import { prisma } from "../db/__mocks__/prisma-client";
import type { List, CountryName } from "../types";
import { ServiceType } from "../../../shared/types";
import { logger } from "../../services/logger";

jest.mock("../db/prisma-client");
jest.mock("server/services/logger");

describe("List Model:", () => {
  const sampleList: List = {
    id: 1,
    reference: "123Reference",
    createdAt: new Date("2021-06-23T11:13:55.236+00:00"),
    updatedAt: new Date("2021-06-23T11:13:55.238+00:00"),
    type: "lawyers",
    countryId: 3,
    country: {
      name: "United Kingdom",
    },
    jsonData: {
      createdBy: "test@gov.uk",
      users: ["test@gov.uk"],
      validators: ["test@gov.uk"],
      administrators: ["test@gov.uk"],
    },
  };

  const sampleUser = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "test@test.com",
    jsonData: { roles: [] },
  }

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
          users: true,
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

      await findListByCountryAndType("United Kingdom", ServiceType.lawyers);

      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: {
          country: {
            name: "United Kingdom",
          },
          type: ServiceType.lawyers,
        },
        include: {
          country: true,
        },
      });
    });

    test("returned value is correct", async () => {
      prisma.list.findMany.mockResolvedValue([sampleList]);

      const result = await findListByCountryAndType("United Kingdom", ServiceType.lawyers);

      expect(result).toMatchObject([sampleList]);
    });

    test("it returns undefined when findUnique call fails", async () => {
      prisma.list.findMany.mockRejectedValue({
        message: "findMany error message",
      });

      const result = await findListByCountryAndType("United Kingdom", ServiceType.lawyers);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith("findListByCountryAndType Error: findMany error message");
    });
  });

  describe("createList", () => {
    const listData = {
      country: "United Kingdom",
      serviceType: ServiceType.lawyers,
      user: "test@gov.uk",
      createdBy: "test@gov.uk",
    };

    beforeEach(() => {
      prisma.user.findMany.mockResolvedValue([sampleUser]);
    });

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
            relatedLinks: getRelatedLinks(listData.serviceType),
            createdBy: listData.createdBy,
          },
          users: {
            connect: {
              email: "test@gov.uk"
            }
          }
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

    test("it throws when users contains a non GOV.UK email address", async () => {
      await expect(
        createList({
          ...listData,
          user: "invalid@email.com",
        })
      ).rejects.toEqual(new Error("User contain a non GOV UK email address"));
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
      serviceType: ServiceType.lawyers,
      user: "test@gov.uk",
      createdBy: "test@gov.uk",
    };

    test("create update is correct", async () => {
      prisma.list.update.mockResolvedValue(sampleList);

      await updateList(listId, listData);

      expect(prisma.list.update).toHaveBeenCalledWith({
        where: {
          id: listId,
        },
        data: {
          users: {
            connect: {
              email: "test@gov.uk"
            }
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

    test("it throws when users contains a non GOV.UK email address", async () => {
      await expect(
        updateList(listId, {
          ...listData,
          user: "invalid@email.com",
        })
      ).rejects.toEqual(new Error("User contain a non GOV UK email address"));
    });
  });
});
