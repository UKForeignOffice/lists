import { NextFunction, Request, Response } from "express";
import { startCase, toLower, trim, pick, compact } from "lodash";
import { dashboardRoutes } from "./routes";
import {
  findUserByEmail,
  findUsers,
  updateUser,
  isSuperAdminUser,
} from "server/models/user";
import {
  createList,
  findUserLists,
  findListByCountryAndType,
  findListById,
  updateList,
} from "server/models/list";
import { UserRoles, ServiceType, List } from "server/models/types";
import {
  filterSuperAdminRole,
  userIsListPublisher,
  userIsListEditor,
  userIsListAdministrator,
} from "./helpers";
import { countriesList } from "server/services/metadata";
import {
  isGovUKEmailAddress,
  isCountryNameValid,
} from "server/utils/validation";
import { QuestionError } from "../lists/types";
import { authRoutes } from "server/auth";
import { getListItemsForList } from "server/models/listItem";

const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
  userIsListPublisher,
  userIsListEditor,
  userIsListAdministrator,
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
  if (req.user?.userData.email === undefined) {
    return res.redirect(authRoutes.logout);
  }

  const lists = await findUserLists(req.user?.userData.email);

  res.render("dashboard/lists.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
    lists,
  });
}

// TODO: test
export async function listsEditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { listId } = req.params;
  const { listCreated, listUpdated } = req.query;
  const isPost = req.method === "POST";

  let list: Partial<List> | undefined;
  let error: QuestionError | {} = {};

  if (isPost) {
    const editors: string[] = compact(
      req.body.editors.split(",").map(trim).map(toLower)
    );
    const publishers: string[] = compact(
      req.body.publishers.split(",").map(trim).map(toLower)
    );
    const administrators: string[] = compact(
      req.body.administrators.split(",").map(trim).map(toLower)
    );

    if (editors.some((email) => !isGovUKEmailAddress(email))) {
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
    } else if (administrators.some((email) => !isGovUKEmailAddress(email))) {
      error = {
        field: "administrators",
        text: "Administrators contain an invalid email address",
        href: "#administrators",
      };
    }

    if (listId === "new") {
      if (!isCountryNameValid(req.body.country)) {
        error = {
          field: "country",
          text: "Invalid country name",
          href: "#country",
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
    }

    if (!("field" in error)) {
      try {
        const data = {
          country: req.body.country,
          serviceType: req.body.serviceType,
          editors: req.body.editors.split(","),
          publishers: req.body.publishers.split(","),
          administrators: req.body.administrators.split(","),
          createdBy: `${req.user?.userData.email}`,
        };

        if (listId === "new") {
          const list = await createList(data);
          if (list?.id !== undefined) {
            return res.redirect(
              `${dashboardRoutes.listsEdit.replace(
                ":listId",
                `${list.id}`
              )}?listCreated=true`
            );
          }
        } else {
          const list = await findListById(listId);

          if (list !== undefined && userIsListAdministrator(req, list)) {
            await updateList(
              Number(listId),
              pick(data, ["editors", "publishers", "administrators"])
            );
            return res.redirect(
              `${dashboardRoutes.listsEdit.replace(
                ":listId",
                `${listId}`
              )}?listUpdated=true`
            );
          }
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
          administrators: req.body.administrators,
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
    listCreated,
    listUpdated,
    isPost,
    error,
    list,
    req,
  });
}

// TODO: test
export async function listsContentManagementController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { listId } = req.params;
  const list = await findListById(listId);

  if (list === undefined) {
    return next();
  }

  const listItems = await getListItemsForList(list);

  // get listItems based list parameters
  res.render("dashboard/lists-content-management.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
    list,
    listItems,
  });
}
