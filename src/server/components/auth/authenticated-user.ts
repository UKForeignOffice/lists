import { User, UserRoles } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

export default class AuthenticatedUser {
  readonly userData: User;
  readonly emailAddress: User["email"];
  readonly roles: UserRoles[];

  constructor(userData: User) {
    this.userData = userData;
    this.emailAddress = userData.email;
    this.roles = userData.jsonData.roles ?? [];
  }

  /**
   * TODO: should really be a native getter, so the User API would be like `user.isSuperAdmin` rather than user.isSuperAdmin().
   */
  isSuperAdmin(): boolean {
    return this.roles.includes(UserRoles.SuperAdmin);
  }

  isListsCreator(): boolean {
    return this.roles.includes(UserRoles.ListsCreator);
  }

  async getLists() {
    const notSuperAdmin = !this.isSuperAdmin();
    const publisherWhere = {
      where: {
        jsonData: {
          path: ["publishers"],
          array_contains: [this.emailAddress],
        },
      },
    };

    const lists = await prisma.list.findMany({
      ...(notSuperAdmin && publisherWhere),
      orderBy: {
        id: "asc",
      },
      include: {
        country: true,
      },
    });

    if (!lists) {
      logger.warn(`User.getLists - no lists found for ${this.emailAddress}`);
    }

    return lists ?? [];
  }
}
