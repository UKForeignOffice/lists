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
      roles: [UserRoles.SuperAdmin, UserRoles.TeamAdmin],
    });
    const notSuperAdmin = createUser({
      roles: [UserRoles.TeamEditor, UserRoles.TeamAdmin],
    });

    expect(superAdmin.isSuperAdmin()).toBeTruthy();
    expect(notSuperAdmin.isSuperAdmin()).toBeFalsy();
  });

  test("isTeamAdmin evaluation is correct", () => {
    const teamAdmin = createUser({
      roles: [UserRoles.TeamAdmin, UserRoles.TeamEditor],
    });
    const notTeamAdmin = createUser({ roles: [UserRoles.TeamEditor] });

    expect(teamAdmin.isTeamAdmin()).toBeTruthy();
    expect(notTeamAdmin.isTeamAdmin()).toBeFalsy();
  });

  test("isTeamEditor evaluation is correct", () => {
    const teamEditor = createUser({
      roles: [UserRoles.TeamAdmin, UserRoles.TeamEditor],
    });
    const notTeamEditor = createUser({ roles: [UserRoles.TeamAdmin] });

    expect(teamEditor.isTeamEditor()).toBeTruthy();
    expect(notTeamEditor.isTeamEditor()).toBeFalsy();
  });

  test("isNewUser evaluation is correct", () => {
    const newUser = createUser({ roles: [] });
    const notNewUser = createUser({ roles: [UserRoles.TeamEditor] });

    expect(newUser.isNewUser()).toBeTruthy();
    expect(notNewUser.isNewUser()).toBeFalsy();
  });
});
