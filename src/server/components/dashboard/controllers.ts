import type { NextFunction, Request, Response } from "express";
import _, { trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isAdministrator, updateUser } from "server/models/user";
import { createList, findListById, updateList } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";

import { isGovUKEmailAddress } from "server/utils/validation";
import type { QuestionError } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";
import { pageTitles } from "server/components/dashboard/helpers";
import * as AnnualReviewHelpers from "server/components/dashboard/annualReview/helpers";
import { UserRoles, ServiceType } from "server/models/types";
import serviceName from "server/utils/service-name";

import type { List } from "server/models/types";

export { listItemsIndexController as listsItemsController } from "./listsItems/listItemsIndexController";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
};

export async function startRouteController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }

    res.redirect(dashboardRoutes.lists);
  } catch (error) {
    next(error);
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
    const errorText = req?.flash("errorText");
    const errorTitle = req?.flash("errorTitle");

    if (typeof userEmail !== "string") {
      return next();
    }

    let error = {};
    if (errorText?.length || errorTitle?.length) {
      error = {
        field: "roles",
        title: errorTitle[0],
        text: errorText[0],
        href: "#roles-Administrator",
      };
    }

    const user = await findUserByEmail(`${userEmail}`);

    res.render("dashboard/users-edit", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.usersEdit],
      UserRoles,
      user,
      req,
      error,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function usersEditPostController(req: Request, res: Response, next: NextFunction) {
  let roles: UserRoles[];
  const usersRoles: UserRoles | UserRoles[] = req.body.roles;
  const { userEmail } = req.params;
  const emailAddress = req?.user?.userData?.email;
  const isAdminUser = await isAdministrator(emailAddress);
  if (!isAdminUser) {
    // disallow editing of SuperAdmins
    logger.warn(`non-admin user ${req.user?.userData.id} attempted to edit user ${userEmail}`);
    return next(new HttpException(405, "405", "You do not have access to edit users"));
  }
  if (emailAddress === userEmail) {
    // disallow editing of SuperAdmins
    logger.warn(`user ${req.user?.userData.id} attempted to change their own permissions`);
    const error = {
      title: "You cannot change your own permissions.",
      text: "You need to ask another administrator to change this for you.",
    };

      req.flash("errorText", error.text);
    req.flash("errorTitle", error.title);
    return res.redirect(`/dashboard/users/${userEmail}`);
  }

  if (Array.isArray(usersRoles)) {
    roles = usersRoles;
  } else {
    roles = (usersRoles ?? "").split(",").map(trim) as UserRoles[];
  }

  const update = await updateUser(userEmail, {
    jsonData: {
      roles,
    },
  });

  req.flash("userUpdatedEmail", userEmail);

  const updateSuccessful = !!update;

  req.flash("userUpdatedSuccessful", `${updateSuccessful}`);
  req.flash("userUpdatedNotificationColour", updateSuccessful ? "green" : "red");

  return res.redirect("/dashboard/users");
}

export async function listsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }

    const lists = await req.user?.getLists();
    const isNewUser = !req.user?.isAdministrator && lists?.length === 0;

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
      isNewUser,
      lists,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

// TODO: test
export async function listsEditController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;

    let list: List | undefined;
    let annualReviewStartDate = "";
    let lastAnnualReviewStartDate = "";
    let templateUrl = "dashboard/lists-new";

    if (listId !== "new") {
      list = await findListById(listId);
      annualReviewStartDate = AnnualReviewHelpers.formatAnnualReviewDate(list as List, "nextAnnualReviewStartDate");
      lastAnnualReviewStartDate = AnnualReviewHelpers.formatAnnualReviewDate(list as List, "lastAnnualReviewStartDate");
      templateUrl = "dashboard/lists-edit";

      if (list === undefined) {
        return next();
      }
    }

    res.render(templateUrl, {
      ...DEFAULT_VIEW_PROPS,
      annualReviewStartDate,
      lastAnnualReviewStartDate,
      listId,
      user: req.user?.userData,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    const err = new HttpException(404, "404", "List could not be found.");
    next(err);
  }
}

export async function listsEditPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const removeButtonClicked = "userEmail" in req.body;

    return removeButtonClicked ? await listEditRemovePublisher(req, res) : await listEditAddPublisher(req, res, next);
  } catch (error) {
    logger.error(`listsEditPostController error: ${(error as Error).message}`);
    next(error);
  }
}

/**
 * TODO: rename - confusing controller name. this is also used to create new lists.
 */
export async function listEditAddPublisher(req: Request, res: Response, next: NextFunction) {
  const listId = res.locals.list.id;
  let error: Partial<QuestionError> = {};

  const data = {
    country: req.body.country,
    serviceType: req.body.serviceType,
    users: req.body.publisher,
    createdBy: `${req.user?.userData.email}`,
  };

  if (listId === "new") {
    const newList = await createList(data);

    const isDuplicateListError = "duplicateListError" in newList!;

    if (isDuplicateListError) {
      const formattedService = _.upperFirst(serviceName(data.serviceType));
      req.flash("error", `A list of ${formattedService} in ${data.country} already exists`);
      res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", "new")}`);
      return;
    }

    if (newList!.id) {
      req.flash("successBannerHeading", "Success");
      req.flash("successBannerMessage", "List created successfully");
      res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", `${newList!.id}`)}`);
      return;
    }
  }

  const user = req.user;

  // TODO: rename to "newUser"
  const publisher: string = req.body.publisher;

  if (!publisher || !isGovUKEmailAddress(publisher)) {
    error = {
      field: "publisher",
      text: !publisher
        ? "Enter an FCO or FCDO email address to add a user, e.g. 'example@fco.gov.uk or example@fcdo.gov.uk'"
        : "New users must have an FCO or FCDO email address, e.g. 'example@fco.gov.uk, or example@fcdo.gov.uk'",
      href: "#publisher",
    };
  }

  const list = await findListById(listId);

  if (!list) {
    return next(new HttpException(404, "404", "List could not be found."));
  }

  if (list?.jsonData.users?.includes?.(publisher)) {
    error = {
      field: "publisher",
      text: "This user already exists on this list",
      href: "#publisher",
    };
  }

  const errorExists = "field" in error;
  // TODO:- implement post redirect get.
  if (errorExists) {
    return res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      listId,
      user: user?.userData,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  }

  req.flash("successBannerHeading", "Success");
  req.flash("successBannerMessage", `User ${publisher} has been created`);

  const newUsers = [...(list.jsonData.users ?? []), publisher];

  await updateList(Number(listId), { users: newUsers });
  return res.redirect(res.locals.listsEditUrl);
}

export async function listEditRemovePublisher(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const userEmail = req.body.userEmail;
  const list: List | undefined = await findListById(listId);

  res.render("dashboard/list-edit-confirm-delete-user", {
    ...DEFAULT_VIEW_PROPS,
    listId,
    userEmail,
    list,
    req,
    csrfToken: getCSRFToken(req),
  });
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

export function helpPageController(req: Request, res: Response): void {
  res.render("dashboard/help", {
    backUrl: req.session.currentUrl ?? "/dashboard/lists",
  });
}
