import { NextFunction, Request, Response } from "express";
import { get, trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isSuperAdminUser, updateUser } from "server/models/user";
import { createList, findListById, updateList } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";
import { List, ServiceType, UserRoles } from "server/models/types";
import { userIsListAdministrator } from "./helpers";
import { isGovUKEmailAddress } from "server/utils/validation";
import { QuestionError } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";
import { pageTitles } from "server/components/dashboard/helpers";

export { listItemsIndexController as listsItemsController } from "./listsItems/listItemsIndexController";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
  userIsListAdministrator,
};

export async function startRouteController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user === undefined) {
      return res.redirect(authRoutes.logout);
    }

    const lists = await req.user.getLists();
    const isNewUser = !req.user?.isSuperAdmin() && get(lists ?? [], "length") === 0;

    res.render("dashboard/dashboard", {
      ...DEFAULT_VIEW_PROPS,
      isNewUser,
      req,
    });
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

    const user = await findUserByEmail(`${userEmail}`);

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

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
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
    const changeMsg = req.flash("changeMsg")[0];

    let list: List | undefined;

    if (listId !== "new") {
      list = await findListById(listId);
      if (list === undefined) {
        return next();
      }
    }

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      publisher: { change: changeMsg },
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

export async function listEditAddPublisher(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listId } = req.params;
  let error: Partial<QuestionError> = {};

  const list: List | undefined = await findListById(listId);
  const publisher: string = req.body.publisher;

  const user = req.user;
  const userIsSuperAdmin = user?.isSuperAdmin();

  if (!userIsSuperAdmin || (listId === "new" && !userIsSuperAdmin)) {
    const err = new HttpException(403, "403", "You are not authorized to access this list.");
    return next(err);
  }

  if (!publisher || !isGovUKEmailAddress(publisher)) {
    error = {
      field: "publisher",
      text: !publisher
        ? "You must indicated a publisher"
        : "New users can only be example@fco.gov.uk, or example@fcdo.gov.uk",
      href: "#publisher",
    };
  }

  if (list?.jsonData.publishers.includes(publisher)) {
    error = {
      field: "publisher",
      text: "This user already exists",
      href: "#publisher",
    };
  }

  const errorExists = "field" in error;

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

  const data = {
    country: req.body.country,
    serviceType: req.body.serviceType,
    validators: [],
    publishers: req.body.publisher,
    administrators: [],
    createdBy: `${req.user?.userData.email}`,
  };

  req.flash("changeMsg", `User ${publisher} has been created`);

  if (listId === "new") {
    const newList = await createList(data);

    if (newList?.id !== undefined) {
      return res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", `${newList.id}`)}`);
    }
  }

  const publishersListWithNewEmail = [...(list as List).jsonData.publishers, publisher];

  if (list !== undefined) {
    await updateList(Number(listId), { publishers: publishersListWithNewEmail });
    return res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", `${listId}`)}`);
  }
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

export async function listPublisherDelete(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const userEmail = req.body.userEmail;
  const list: List | undefined = await findListById(listId);
  const userHasRemovedOwnEmail = userEmail === req.user?.userData.email;

  if (userHasRemovedOwnEmail) {
    const error = {
      field: "publisherList",
      text: "You cannot remove your own email address from a list",
      href: "#publishers",
    };

    return res.render("dashboard/list-edit-confirm-delete-user", {
      ...DEFAULT_VIEW_PROPS,
      listId,
      userEmail,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  }

  const updatedPublishers = (list as List).jsonData.publishers.filter((publisher) => publisher !== userEmail);

  await updateList(Number(listId), { publishers: updatedPublishers });

  req.flash("changeMsg", `User ${userEmail} has been removed`);

  return res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", `${listId}`)}`);
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
