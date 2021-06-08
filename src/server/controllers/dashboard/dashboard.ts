import { NextFunction, Request, Response } from "express";
import { startCase, toLower, trim } from "lodash";
import { dashboardRoutes } from "./routes";
import {
  findUserByEmail,
  findUsers,
  updateUser,
  isSuperAdminUser,
} from "server/models/user";
import {
  createList,
  findListByCountryAndType,
  findListById,
} from "server/models/list";
import { UserRoles, ServiceType, List } from "server/models/types";
import { filterSuperAdminRole } from "./helpers";
import { countriesList } from "server/services/metadata";
import {
  isGovUKEmailAddress,
  isCountryNameValid,
} from "server/utils/validation";
import { QuestionError } from "../lists/types";

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
export async function listsController(
  req: Request,
  res: Response
): Promise<void> {
  // TODO

  //
  // get lists assigned to logged user

  res.render("dashboard/lists.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

export async function listsEditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { listId } = req.params;
  let list: Partial<List> | undefined;

  let error: QuestionError = {
    field: "",
    href: "",
    text: "",
  };

  if (req.method === "POST") {
    const editors: string[] = req.body.editors
      .split(",")
      .map(trim)
      .map(toLower);
    const publishers: string[] = req.body.publishers
      .split(",")
      .map(trim)
      .map(toLower);

    if (!isCountryNameValid(req.body.country)) {
      error = {
        field: "country",
        text: "Invalid country name",
        href: "#country",
      };
    } else if (editors.some((email) => !isGovUKEmailAddress(email))) {
      error = {
        field: "editors",
        text: "Editors contain an invalid email address",
        href: "#editors",
      };
    } else if (publishers.some((email) => !isGovUKEmailAddress(email))) {
      error = {
        field: "publishers",
        text: "Publishers contain an invalid email address",
        href: "#editors",
      };
    } else {
      const existingLists = await findListByCountryAndType(
        req.body.country,
        req.body.serviceType
      );

      if (existingLists !== undefined && existingLists?.length > 0) {
        error = {
          field: "serviceType",
          text: `A ${startCase(req.body.serviceType)} list for ${
            req.body.country
          } already exists`,
          href: "#serviceType",
        };
      }
    }

    if (error.field === undefined) {
      try {
        const data = {
          country: req.body.country,
          serviceType: req.body.serviceType,
          editors: req.body.editors.split(","),
          publishers: req.body.publishers.split(","),
        };

        const list = await createList(data);

        if (list?.id !== undefined) {
          return res.redirect(
            `${dashboardRoutes.listsEdit.replace(":listId", `${list.id}`)}`
          );
        }
      } catch (error) {
        next(error);
      }
    } else {
      list = {
        type: req.body.serviceType,
        jsonData: {
          editors: req.body.editors,
          publishers: req.body.publishers,
        },
        country: {
          name: req.body.country,
        },
      };
    }
  }

  if (listId !== "new") {
    list = await findListById(listId);
    if (list === undefined) {
      return next();
    }
  }

  res.render("dashboard/lists-edit.html", {
    ...DEFAULT_VIEW_PROPS,
    listId,
    error,
    list,
    req,
  });
}
