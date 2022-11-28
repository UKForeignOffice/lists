import { AuthenticatedUser } from "../authenticated-user";
import { List, UserRoles } from "server/models/types";
import { prisma } from "../../../models/db/__mocks__/prisma-client";

describe("AuthenticatedUser", () => {
  function createUser({ roles }: { roles: UserRoles[] }): AuthenticatedUser {
    return new AuthenticatedUser({
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
    const expectedQuery = {
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
    };

    const sampleList: List = {
      id: 1,
      reference: "123Reference",
      createdAt: new Date("2021-06-23T11:13:55.236+00:00"),
      updatedAt: new Date("2021-06-23T11:13:55.238+00:00"),
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

    test("query is correct for superAdmin", async () => {
      const superAdmin = createUser({
        roles: [UserRoles.SuperAdmin],
      });

      expect(superAdmin.getLists());

      expect(prisma.list.findMany).toHaveBeenCalledWith({
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
