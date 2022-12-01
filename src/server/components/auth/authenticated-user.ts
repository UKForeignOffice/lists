import { List, User, UserRoles } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

export default class AuthenticatedUser {
  readonly userData: User;
  readonly emailAddress: User["email"];
  readonly roles: UserRoles[];
  readonly id: User["id"];

  constructor(userData: User) {
    this.userData = userData;
    this.emailAddress = userData.email;
    this.roles = userData.jsonData.roles ?? [];
    this.id = userData.id;
  }

  /**
   * TODO: should really be a native getter, so the User API would be like `user.isSuperAdmin` rather than user.isSuperAdmin().
   */
  isSuperAdmin(): boolean {
    return this.roles.includes(UserRoles.SuperAdmin);
  }

  async getLists() {
    const notSuperAdmin = !this.isSuperAdmin();
    const whereInputForUser = {
      where: {
        jsonData: {
          path: ["users"],
          array_contains: [this.emailAddress],
        },
      },
    };

    const lists = await prisma.list.findMany({
      ...(notSuperAdmin && whereInputForUser),
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

  async hasAccessToList(id: List["id"]) {
    if (this.isSuperAdmin()) {
      return true;
    }

    const result = await prisma.list.findFirst({
      where: {
        id,
        jsonData: {
          path: ["users"],
          array_contains: [this.emailAddress],
        },
      },
    });

    return !!result;
  }
}
