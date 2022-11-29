import { NextFunction, Request, Response } from "express";
import { compact, get, pick, startCase, toLower, trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isSuperAdminUser, updateUser } from "server/models/user";
import { createList, findListById, updateList } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";
import { List, ServiceType, UserRoles } from "server/models/types";
import { filterSuperAdminRole, pageTitles, userIsListAdministrator, userIsListValidator } from "./helpers";
import { isGovUKEmailAddress } from "server/utils/validation";
import { QuestionError } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";

export { listItemsIndexController as listsItemsController } from "./listsItems/listItemsIndexController";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
  userIsListValidator,
  userIsListAdministrator,
};

export async function startRouteController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }

    const lists = [];
    const isNewUser = !req.user?.isSuperAdmin() && !req.user?.isListsCreator() && get(lists ?? [], "length") === 0;

    return res.render("dashboard/dashboard", {
      ...DEFAULT_VIEW_PROPS,
      lists,
      isNewUser,
      req,
    });
  } catch (error) {
    return next(error);
  }
}

export async function usersListController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await findUsers();
    res.render("dashboard/users-list", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.usersList],
      users,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function usersEditController(req: Request, res: Response, next: NextFunction) {
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
        logger.warn(`user ${req.user?.userData.id} attempted to edit super user ${userEmail}`);
        return next(new HttpException(405, "405", "Not allowed to edit super admin account"));
      }
    } catch (error) {
      return next(error);
    }

    if (req.method === "POST") {
      let roles: UserRoles[];
      const usersRoles: UserRoles | UserRoles[] = req.body.roles;

      if (Array.isArray(usersRoles)) {
        roles = usersRoles;
      } else {
        roles = (usersRoles ?? "").split(",").map(trim) as UserRoles[];
      }

      await updateUser(userEmail, {
        jsonData: {
          roles,
        },
      });

      userSaved = true;
    }

    const user = await findUserByEmail(userEmail);

    res.render("dashboard/users-edit", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.usersEdit],
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

export async function listsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }

    const lists = await req.user?.getLists();

    return res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      req, // TODO:- deprecate, just pass `user`.
      lists,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    return next(error);
  }
}

// TODO: test
export async function listsEditController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const changeMsg = req.flash("changeMsg")[0];

    const list = await findListById(res.locals.list.id);

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.listsEdit],
      publisher: { change: changeMsg },
      user: req.user?.userData,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    logger.error(error);
    const err = new HttpException(404, "404", "List could not be found.");
    next(err);
  }
}

// TODO: test
export async function feedbackController(req: Request, res: Response, next: NextFunction): Promise<void> {
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
