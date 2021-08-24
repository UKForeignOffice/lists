import { AuthenticatedUser } from "../authenticated-user";
import { UserRoles } from "server/models/types";

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
});
