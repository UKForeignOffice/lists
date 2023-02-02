import { omit, pick } from "lodash";
import { prisma } from "../db/__mocks__/prisma-client";
import { UserRoles } from "../types";
import { findUserByEmail, createUser, updateUser, findUsers } from "../user";

jest.mock("../db/prisma-client");

describe("User Model:", () => {
  const sampleUser: any = {
    id: 123,
    createdAt: "2021-06-08 13:00:29.633",
    updatedAt: "2021-06-08 13:00:29.633",
    email: "test@depto.gov.uk",
    jsonData: {
      roles: [UserRoles.Administrator],
    },
  };

  describe("findUserByEmail", () => {
    test("findUnique command is correct", async () => {
      prisma.user.findUnique.mockResolvedValue(sampleUser);

      await findUserByEmail(sampleUser.email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: sampleUser.email,
        },
      });
    });

    test("result is correct", async () => {
      prisma.user.findUnique.mockResolvedValue(sampleUser);

      const result = await findUserByEmail(sampleUser.email);

      expect(result).toBe(sampleUser);
    });

    test("it returns undefined if user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await findUserByEmail(sampleUser.email);

      expect(result).toBeUndefined();
    });
  });

  describe("createUser", () => {
    test("it won't create user if email address is not GOV UK", async () => {
      prisma.user.create.mockResolvedValue(sampleUser);

      const result = await createUser({
        email: "notgovuk@gmail.com",
        jsonData: {},
      });

      expect(result).toBeUndefined();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    test("create command is correct", async () => {
      prisma.user.create.mockResolvedValue(sampleUser);

      await createUser({
        email: sampleUser.email.toUpperCase(),
        jsonData: sampleUser.jsonData,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: sampleUser.email.toLowerCase(),
          jsonData: sampleUser.jsonData,
        },
      });
    });

    test("result is correct", async () => {
      prisma.user.create.mockResolvedValue(sampleUser);
      const newUser = pick(sampleUser, ["email", "jsonData"]);

      const result = await createUser(newUser);

      expect(result).toBe(sampleUser);
    });

    test("it returns undefined if create command fails", async () => {
      prisma.user.create.mockRejectedValue("");
      const newUser = pick(sampleUser, ["email", "jsonData"]);

      const result = await createUser(newUser);

      expect(result).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    test("update command is correct", async () => {
      prisma.user.update.mockResolvedValue(sampleUser);
      const user = {
        email: sampleUser.email,
        jsonData: { ...sampleUser.jsonData },
      };

      const result = await updateUser(sampleUser.email.toUpperCase(), user);

      expect(result).toBe(sampleUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: sampleUser.email },
        data: omit(
          {
            ...user,
          },
          ["email"]
        ),
      });
    });

    test("it won't update if user email address is not gov uk", async () => {
      prisma.user.update.mockResolvedValue(sampleUser);
      const user = {
        email: "notgovuk@email.com",
        jsonData: { ...sampleUser.jsonData },
      };

      const result = await updateUser(user.email, user);

      expect(result).toBeUndefined();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test("it returns undefined if update query fails", async () => {
      prisma.user.update.mockRejectedValue("");
      const user = {
        email: sampleUser.email,
        jsonData: { ...sampleUser.jsonData },
      };

      const result = await updateUser(user.email, user);

      expect(result).toBeUndefined();
    });
  });

  describe("findUsers", () => {
    test("findMany command is correct", async () => {
      prisma.user.findMany.mockResolvedValue([sampleUser]);

      const result = await findUsers();

      expect(result).toMatchObject([sampleUser]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: {
          email: "asc",
        },
      });
    });

    test("it returns an empty list if findMany command fails", async () => {
      prisma.user.findMany.mockRejectedValue("");

      const result = await findUsers();

      expect(result).toMatchObject([]);
    });
  });
});
