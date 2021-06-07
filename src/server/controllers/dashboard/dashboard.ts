import { NextFunction, Request, Response } from "express";
import { trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, updateUser } from "server/models/user";
import { UserRoles } from "server/models/types";
import { filterSuperAdminRole } from "./helpers";

const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
};

export function startRouteController(req: Request, res: Response): void {
  res.render("dashboard/dashboard.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

export async function usersRouteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { editUser } = req.query;
  let userSaved = false;

  if (req.user === undefined || !req.user.isSuperAdmin()) {
    res.status(405).send("Not allowed");
    return;
  }

  if (typeof editUser === "string") {
    // editing user

    if (
      req.user.isSuperAdmin() &&
      req.user.userData.email.toLowerCase() === editUser.toLowerCase()
    ) {
      // SuperAdmin is editing herself, disallow it for now
      res.status(405).send("Not allowed to edit your own account");
      return;
    }

    if (req.method === "POST") {
      const roles = (req.body.roles ?? "").split(",").map(trim);

      try {
        await updateUser(editUser, {
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

    const user = await findUserByEmail(`${editUser}`);
    res.render("dashboard/users-edit.html", {
      ...DEFAULT_VIEW_PROPS,
      UserRoles,
      userSaved,
      user,
      req,
    });
  } else {
    // seeing users list
    const users = await findUsers();
    res.render("dashboard/users.html", {
      ...DEFAULT_VIEW_PROPS,
      users,
      req,
    });
  }
}

export async function listsRouteController(
  req: Request,
  res: Response
): Promise<void> {
  res.render("dashboard/lists.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}
