import type { List, User } from "server/models/types";
import { UserRoles } from "server/models/types";
import { prisma } from "shared/prisma";
import { logger } from "server/services/logger";
import type { Prisma } from "@prisma/client";

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

  get isAdministrator() {
    return this.roles.includes(UserRoles.Administrator);
  }

  async getLists(orderBy?: Prisma.ListsForDashboardFindManyArgs["orderBy"]) {
    const notSuperAdmin = !this.isAdministrator;
    const whereInputForUser = {
      where: {
        jsonData: {
          path: ["users"],
          array_contains: [this.emailAddress],
        },
      },
    };

    const lists = await prisma.listsForDashboard.findMany({
      ...(notSuperAdmin && whereInputForUser),
      ...(orderBy && { orderBy }),
    });

    if (!lists) {
      logger.warn(`User.getLists - no lists found for ${this.emailAddress}`);
    }

    return lists ?? [];
  }

  async hasAccessToList(id: List["id"] | "new") {
    if (this.isAdministrator) {
      return true;
    }

    if (id === "new") {
      return false;
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
