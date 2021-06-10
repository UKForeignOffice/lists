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
      roles: [UserRoles.SuperAdmin, UserRoles.ListsAdmin],
    });
    const notSuperAdmin = createUser({
      roles: [UserRoles.ListEditor, UserRoles.ListsAdmin],
    });

    expect(superAdmin.isSuperAdmin()).toBeTruthy();
    expect(notSuperAdmin.isSuperAdmin()).toBeFalsy();
  });

  test("ListsAdmin evaluation is correct", () => {
    const teamAdmin = createUser({
      roles: [UserRoles.ListsAdmin, UserRoles.ListEditor],
    });
    const notTeamAdmin = createUser({ roles: [UserRoles.ListEditor] });

    expect(teamAdmin.ListsAdmin()).toBeTruthy();
    expect(notTeamAdmin.ListsAdmin()).toBeFalsy();
  });
});
