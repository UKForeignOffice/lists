import { isEmpty } from "lodash";
import { User, UserRoles } from "server/models/types";

export class AuthenticatedUser {
  public readonly userData: User;

  constructor(userData: User) {
    this.userData = userData;
  }

  isSuperAdmin(): boolean {
    return (
      this.userData.jsonData?.roles?.includes(UserRoles.SuperAdmin) === true
    );
  }

  isTeamAdmin(): boolean {
    return (
      this.userData.jsonData?.roles?.includes(UserRoles.ListsAdmin) === true
    );
  }

  isNewUser(): boolean {
    return isEmpty(this.userData.jsonData?.roles);
  }
}
