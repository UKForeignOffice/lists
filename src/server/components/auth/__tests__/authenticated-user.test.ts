import { AuthenticatedUser } from "../authenticated-user";
import { List, UserRoles } from "server/models/types";
import { prisma } from "../../../models/db/__mocks__/prisma-client";
jest.mock("./../../../models/db/prisma-client");

describe("AuthenticatedUser", () => {
  function createUser({ roles }: { roles: UserRoles[] }): AuthenticatedUser {
    return new AuthenticatedUser({
      email: "test@gov.uk",
      jsonData: {
        roles: [...roles],
      },
    } as any);
  }

  test("isSuperAdmin evaluation is correct", () => {
    const superAdmin = createUser({
      roles: [UserRoles.SuperAdmin],
    });
    const notSuperAdmin = createUser({
      roles: [UserRoles.ListsCreator],
    });

    expect(superAdmin.isSuperAdmin()).toBeTruthy();
    expect(notSuperAdmin.isSuperAdmin()).toBeFalsy();
  });

  test("isListsCreator evaluation is correct", () => {
    const listsCreator = createUser({
      roles: [UserRoles.ListsCreator],
    });
    const notListCreator = createUser({ roles: [UserRoles.SuperAdmin] });

    expect(listsCreator.isListsCreator()).toBeTruthy();
    expect(notListCreator.isListsCreator()).toBeFalsy();
  });

  describe("getLists", () => {
    test("query is correct for superAdmin", async () => {
      const superAdmin = createUser({
        roles: [UserRoles.SuperAdmin],
      });

      await superAdmin.getLists();

      expect(prisma.list.findMany).toHaveBeenCalledWith({
        orderBy: {
          id: "asc",
        },
        include: {
          country: true,
        },
      });
    });

    test("query is correct for listCreator", async () => {
      const listsCreator = createUser({
        roles: [UserRoles.ListsCreator],
      });

      await listsCreator.getLists();
      expect(prisma.list.findMany).toHaveBeenCalledWith({
        where: {
          jsonData: {
            path: ["publishers"],
            array_contains: ["test@gov.uk"],
          },
        },
        orderBy: {
          id: "asc",
        },
        include: {
          country: true,
        },
      });
    });
  });
});
