import { pick } from "lodash";
import { prisma } from "../db/prisma-client";
import { UserRoles } from "../types";
import { findUserByEmail, createUser } from "../user";

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
    returnValue: any = sampleUser
  ): jest.SpyInstance => {
    return jest.spyOn(prisma.user, "findUnique").mockResolvedValue(returnValue);
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
});
