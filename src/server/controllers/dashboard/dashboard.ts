import { NextFunction, Request, Response } from "express";
import { trim } from "lodash";
import { dashboardRoutes } from "./routes";
import {
  findUserByEmail,
  findUsers,
  updateUser,
  isSuperAdminUser,
} from "server/models/user";
import { UserRoles, ServiceType } from "server/models/types";
import { filterSuperAdminRole } from "./helpers";
import { countriesList } from "server/services/metadata";

const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
};

// TODO: test
export function startRouteController(req: Request, res: Response): void {
  res.render("dashboard/dashboard.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

// TODO: test
export async function usersListController(
  req: Request,
  res: Response
): Promise<void> {
  // seeing users list
  const users = await findUsers();
  res.render("dashboard/users-list.html", {
    ...DEFAULT_VIEW_PROPS,
    users,
    req,
  });
}

// TODO: test
export async function usersEditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userEmail } = req.params;

  if (typeof userEmail !== "string") {
    return next();
  }

  let userSaved = false;
  let isEditingSuperAdminUser = false;

  try {
    isEditingSuperAdminUser = await isSuperAdminUser(userEmail);
    if (isEditingSuperAdminUser) {
      // disallow editing of SuperAdmins
      res.status(405).send("Not allowed to edit super admin account");
      return;
    }
  } catch (error) {
    return next(error);
  }

  if (req.method === "POST") {
    const roles = (req.body.roles ?? "").split(",").map(trim);

    try {
      await updateUser(userEmail, {
        jsonData: {
          roles: filterSuperAdminRole(roles),
        },
      });
      userSaved = true;
    } catch (error) {
      next(error);
      return;
    }
  }

  const user = await findUserByEmail(`${userEmail}`);

  res.render("dashboard/users-edit.html", {
    ...DEFAULT_VIEW_PROPS,
    UserRoles,
    userSaved,
    user,
    req,
  });
}

// TODO: test
export async function listsRouteController(
  req: Request,
  res: Response
): Promise<void> {
  const { listId } = req.query;

  if (
    req.user === undefined ||
    !(req.user.isSuperAdmin() || req.user.isTeamAdmin())
  ) {
    res.status(405).send("Not allowed");
    return;
  }

  if (typeof listId === "string") {
    // let list;

    if (listId !== "new") {
      // get list by id
    }

    res.render("dashboard/lists-edit.html", {
      ...DEFAULT_VIEW_PROPS,
      listId,
      req,
    });
  } else {
    res.render("dashboard/lists.html", {
      ...DEFAULT_VIEW_PROPS,
      req,
    });
  }
}
