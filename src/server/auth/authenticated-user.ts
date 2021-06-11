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

  isListsCreator(): boolean {
    return (
      this.userData.jsonData?.roles?.includes(UserRoles.ListsCreator) === true
    );
  }
}
