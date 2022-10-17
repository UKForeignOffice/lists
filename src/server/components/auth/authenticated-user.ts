import { User, UserRoles } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { ListWithJsonData } from "server/components/dashboard/helpers";

export class AuthenticatedUser {
  public readonly userData: User;

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

  async isListPublisher(listId: number): Promise<boolean> {
    const result = await prisma.list.findFirst({
      select: {
        id: true,
      },
      where: {
        id: listId,
        AND: {
          jsonData: {
            path: ["publishers"],
            array_contains: this.userData.email,
          },
        },
      },
    });

    return !!result;
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

  isListPublisher(list: ListWithJsonData): boolean {
    const email = this.userData.email;

    return email !== undefined
      ? Boolean(list?.jsonData?.publishers?.includes(email))
      : false;
  }
}
