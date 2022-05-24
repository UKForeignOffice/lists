import { NextFunction, Request, Response } from "express";
import { compact, get, pick, startCase, toLower, trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isSuperAdminUser, updateUser, } from "server/models/user";
import { createList, findListByCountryAndType, findListById, findUserLists, updateList, } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";
import {
  CountryName,
  List,
  ServiceType,
  UserRoles
} from "server/models/types";
import {
  filterSuperAdminRole,
  userIsListAdministrator,
  userIsListPublisher,
  userIsListValidator,
} from "./helpers";
import { isCountryNameValid, isGovUKEmailAddress, } from "server/utils/validation";
import { QuestionError, } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { getCSRFToken } from "server/components/cookies/helpers";

export { listItemsIndexController as listsItemsController } from "./listsItems/listItemsIndexController";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
  userIsListPublisher,
  userIsListValidator,
  userIsListAdministrator,
};

export async function startRouteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user === undefined) {
      return res.redirect(authRoutes.logout);
    }

    const lists = await findUserLists(req.user?.userData.email);
    const isNewUser =
      !req.user?.isSuperAdmin() &&
      !req.user?.isListsCreator() &&
      get(lists ?? [], "length") === 0;

    res.render("dashboard/dashboard", {
      ...DEFAULT_VIEW_PROPS,
      isNewUser,
      req,
    });
  } catch (error) {
    next(error);
  }
}

export async function usersListController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await findUsers();
    res.render("dashboard/users-list", {
      ...DEFAULT_VIEW_PROPS,
      users,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function usersEditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
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

      await updateUser(userEmail, {
        jsonData: {
          roles: filterSuperAdminRole(roles),
        },
      });

      userSaved = true;
    }

    const user = await findUserByEmail(`${userEmail}`);

    res.render("dashboard/users-edit", {
      ...DEFAULT_VIEW_PROPS,
      UserRoles,
      userSaved,
      user,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function listsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user?.userData.email === undefined) {
      return res.redirect(authRoutes.logout);
    }

    const lists = (await findUserLists(req.user?.userData.email)) ?? [];

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      req,
      lists,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

// TODO: test
export async function listsEditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const { listCreated, listUpdated } = req.query;
    const isPost = req.method === "POST";

    let list: Partial<List> | undefined;
    let error: QuestionError | {} = {};

    if (isPost) {
      const validators: string[] = compact(
        req.body.validators.split(",").map(trim).map(toLower)
      );
      const publishers: string[] = compact(
        req.body.publishers.split(",").map(trim).map(toLower)
      );
      const administrators: string[] = compact(
        req.body.administrators.split(",").map(trim).map(toLower)
      );

      if (
        validators.length === 0 ||
        validators.some((email) => !isGovUKEmailAddress(email))
      ) {
        error = {
          field: "validators",
          text:
            validators.length === 0
              ? "You must indicated at least one validator"
              : "Validators contain an invalid email address",
          href: "#validators",
        };
      } else if (
        publishers.length === 0 ||
        publishers.some((email) => !isGovUKEmailAddress(email))
      ) {
        error = {
          field: "publishers",
          text:
            publishers.length === 0
              ? "You must indicated at least one publisher"
              : "Publishers contain an invalid email address",
          href: "#publishers",
        };
      } else if (
        administrators.length === 0 ||
        administrators.some((email) => !isGovUKEmailAddress(email))
      ) {
        error = {
          field: "administrators",
          text:
            administrators.length === 0
              ? "You must indicated at least one administrator"
              : "Administrators contain an invalid email address",
          href: "#administrators",
        };
      }

      if (listId === "new") {
        // TODO validate servicetype exists?
        if (req.body.serviceType === undefined) {
          error = {
            field: "serviceType",
            text: "Please select service type",
            href: "#serviceType",
          };
        } else if (!isCountryNameValid(req.body.country)) {
          error = {
            field: "country",
            text: "Invalid country name",
            href: "#country",
          };
        } else {
          const existingLists = await findListByCountryAndType(
            req.body.country as CountryName,
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
        const data = {
          country: req.body.country,
          serviceType: req.body.serviceType,
          validators: req.body.validators.split(","),
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
              pick(data, ["validators", "publishers", "administrators"])
            );
            return res.redirect(
              `${dashboardRoutes.listsEdit.replace(
                ":listId",
                `${listId}`
              )}?listUpdated=true`
            );
          }
        }
      } else {
        list = {
          type: req.body.serviceType,
          jsonData: {
            validators: req.body.validators,
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

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      listCreated,
      listUpdated,
      listId,
      isPost,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

// TODO: test
export async function feedbackController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const feedbacksList = await findFeedbackByType("serviceFeedback");
    res.render("dashboard/feedbacks-list", {
      ...DEFAULT_VIEW_PROPS,
      feedbacksList,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}
