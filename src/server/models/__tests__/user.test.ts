import { pick } from "lodash";
import { prisma } from "../db/prisma-client";
import { UserRoles } from "../types";
import {
  findUserByEmail,
  createUser,
  updateUser,
  findUsers,
  isSuperAdminUser,
} from "../user";

describe("User Model:", () => {
  const sampleUser = {
    id: 123,
    createdAt: "2021-06-08 13:00:29.633",
    updatedAt: "2021-06-08 13:00:29.633",
    email: "test@depto.gov.uk",
    jsonData: {
      roles: [UserRoles.SuperAdmin],
    },
  };

  const spyUserFindUnique = (
    returnValue: any = sampleUser,
    shouldReject: boolean = false
  ): jest.SpyInstance => {
    const spy = jest.spyOn(prisma.user, "findUnique");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  };

  const spyUserCreate = (
    returnValue: any = sampleUser,
    shouldReject: boolean = false
  ): jest.SpyInstance => {
    const spy = jest.spyOn(prisma.user, "create");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  };

  const spyUserUpdate = (
    returnValue: any = sampleUser,
    shouldReject: boolean = false
  ): jest.SpyInstance => {
    const spy = jest.spyOn(prisma.user, "update");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  };

  const spyFindMany = (
    returnValue: any[] = [sampleUser],
    shouldReject: boolean = false
  ): jest.SpyInstance => {
    const spy = jest.spyOn(prisma.user, "findMany");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  };

  describe("findUserByEmail", () => {
    test("findUnique command is correct", async () => {
      const spy = spyUserFindUnique();

      await findUserByEmail(sampleUser.email);

      expect(spy).toHaveBeenCalledWith({
        where: {
          email: sampleUser.email,
        },
      });
    });

    test("result is correct", async () => {
      spyUserFindUnique();
      const result = await findUserByEmail(sampleUser.email);
      expect(result).toBe(sampleUser);
    });

    test("it returns undefined if user is not found", async () => {
      spyUserFindUnique(null);
      const result = await findUserByEmail(sampleUser.email);
      expect(result).toBeUndefined();
    });
  });

  describe("createUser", () => {
    test("it won't create user if email address is not GOV UK", async () => {
      const spy = spyUserCreate();

      const result = await createUser({
        email: "notgovuk@gmail.com",
        jsonData: {},
      });

      expect(result).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    });

    test("create command is correct", async () => {
      const spy = spyUserCreate();
      const newUser = pick(sampleUser, ["email", "jsonData"]);

      await createUser(newUser);

      expect(spy).toHaveBeenCalledWith({
        data: newUser,
      });
    });

    test("result is correct", async () => {
      spyUserCreate();
      const newUser = pick(sampleUser, ["email", "jsonData"]);

      const result = await createUser(newUser);

      expect(result).toBe(sampleUser);
    });

    test("it returns undefined if create command fails", async () => {
      spyUserCreate(sampleUser, true);
      const newUser = pick(sampleUser, ["email", "jsonData"]);

      const result = await createUser(newUser);

      expect(result).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    test("update command is correct", async () => {
      const spy = spyUserUpdate();
      const user = {
        email: sampleUser.email,
        jsonData: { ...sampleUser.jsonData },
      };

      const result = await updateUser(user.email, user);

      expect(result).toBe(sampleUser);
      expect(spy).toHaveBeenCalledWith({
        where: { email: user.email },
        data: {
          ...user,
        },
      });
    });

    test("it won't update if user email address is not gov uk", async () => {
      const spy = spyUserUpdate();
      const user = {
        email: "notgovuk@email.com",
        jsonData: { ...sampleUser.jsonData },
      };

      const result = await updateUser(user.email, user);

      expect(result).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    });

    test("it returns undefined if update query fails", async () => {
      spyUserUpdate(sampleUser, true);
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
      const spy = spyFindMany();

      const result = await findUsers();

      expect(result).toMatchObject([sampleUser]);
      expect(spy).toHaveBeenCalledWith({
        orderBy: {
          email: "asc",
        },
      });
    });

    test("it returns an empty list if findMany command fails", async () => {
      spyFindMany([sampleUser], true);

      const result = await findUsers();

      expect(result).toMatchObject([]);
    });
  });

  describe("isSuperAdminUser", () => {
    test("it returns true when user is a SuperAdmin", async () => {
      spyUserFindUnique();

      const result = await isSuperAdminUser(sampleUser.email);

      expect(result).toBeTruthy();
    });

    test("it returns false when user is not a SuperAdmin", async () => {
      spyUserFindUnique({
        ...sampleUser,
        jsonData: {
          roles: [],
        },
      });

      const result = await isSuperAdminUser(sampleUser.email);

      expect(result).toBeFalsy();
    });
  });
});
