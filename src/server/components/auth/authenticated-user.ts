import type { List, User } from "server/models/types";
import { UserRoles } from "server/models/types";
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

  get isAdministrator() {
    return this.roles.includes(UserRoles.Administrator);
  }

  async getLists(orderByInput?: Record<string, string>) {
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
      orderBy: AuthenticatedUser.calculateSortOrder(orderByInput),
    });

    if (!lists) {
      logger.warn(`User.getLists - no lists found for ${this.emailAddress}`);
    }

    return lists ?? [];
  }

  static calculateSortOrder(customSortOrder?: Record<string, string>): Array<Record<string, string>> {
    const defaultSortOrder: Array<Record<string, string>> = [
      {
        country: "asc",
      },
      {
        type: "asc",
      },
    ];

    if (!customSortOrder) return defaultSortOrder;

    const queryParamToColumnNames = {
      administrators: "admins",
      serviceProviders: "live",
      annualReview: "isOverdue",
    };

    type QueryParamKeys = keyof typeof queryParamToColumnNames;

    const formatCustomSortOrder = Object.entries(customSortOrder).map(([key, value]) => {
      const columnName = queryParamToColumnNames[key as QueryParamKeys];
      const checkedValue = value === "asc" || value === "desc" ? value : "asc";

      return {
        [columnName]: checkedValue,
      };
    });

    return formatCustomSortOrder;
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
