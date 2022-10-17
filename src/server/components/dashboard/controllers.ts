import { NextFunction, Request, Response } from "express";
import { get, startCase, trim } from "lodash";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isSuperAdminUser, updateUser } from "server/models/user";
import { createList, findListByCountryAndType, findListById, updateList } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";
import { CountryName, List, ServiceType, UserRoles } from "server/models/types";
import { pageTitles, userIsListAdministrator, userIsListPublisher, userIsListValidator } from "./helpers";
import { isCountryNameValid, isGovUKEmailAddress } from "server/utils/validation";
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
  userIsListPublisher,
  userIsListValidator,
  userIsListAdministrator,
};

export async function startRouteController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user === undefined) {
      return res.redirect(authRoutes.logout);
    }

    const lists = await req.user.getLists();
    const isNewUser = !req.user?.isSuperAdmin() && !req.user?.isListsCreator() && get(lists ?? [], "length") === 0;

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
    const { publisherEmail } = req.params;

    if (typeof publisherEmail !== "string") {
      return next();
    }

    let userSaved = false;
    let isEditingSuperAdminUser = false;

    try {
      isEditingSuperAdminUser = await isSuperAdminUser(publisherEmail);
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

      await updateUser(publisherEmail, {
        jsonData: {
          roles,
        },
      });

      userSaved = true;
    }

    const user = await findUserByEmail(`${publisherEmail}`);

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
    const { listCreated, listUpdated, publisherDeleted, publisherEmail } = req.query;

    let list: List | undefined;

    if (listId !== "new") {
      list = await findListById(listId);
      if (list === undefined) {
        return next();
      }
    }

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.listsEdit],
      listCreated,
      listUpdated,
      publiser: { deleted: publisherDeleted, message: `User ${publisherEmail} has been removed`},
      listId,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function listsEditPostController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const { listCreated, listUpdated, publisherDeleted } = req.query;

    let error: QuestionError | {} = {};

    const list: List | undefined = await findListById(listId);
    const publisher: string = req.body.publishers;

    const user = req.user;
    if (!user?.isSuperAdmin() &&
      (!user?.userData?.email || publisher === user?.userData?.email ||
        (listId === "new" && !user?.isSuperAdmin()))
    ) {
      const err = new HttpException(403, "403", "You are not authorized to access this list.");
      return next(err);
    }

    if (!publisher || !isGovUKEmailAddress(publisher)) {
      error = {
        field: "publishers",
        text:
          !publisher
            ? "You must indicated a publisher"
            : "Publisher contains an invalid email address",
        href: "#publishers",
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

    const noErrorsExist = !("field" in error);

    if (noErrorsExist) {
      const data = {
        country: req.body.country,
        serviceType: req.body.serviceType,
        validators: [],
        publishers: req.body.publishers,
        administrators: [],
        createdBy: `${req.user?.userData.email}`,
      };

      if (listId === "new") {
        const newList = await createList(data);
        if (newList?.id !== undefined) {
          return res.redirect(
            `${dashboardRoutes.listsEdit.replace(
              ":listId",
              `${newList.id}`
            )}?listCreated=true`
          );
        }
      }

      const updatedPublishers = [...(list as List).jsonData.publishers, publisher];

      if (list !== undefined && userIsListAdministrator(req, list)) {
        await updateList(
          Number(listId),
          {publishers: updatedPublishers}
        );
        return res.redirect(
          `${dashboardRoutes.listsEdit.replace(
            ":listId",
            `${listId}`
          )}?listUpdated=true`
        );
      }
    }

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      listCreated,
      listUpdated,
      publisherDeleted,
      listId,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    next(error);
  }
}

export async function listPublisherDelete(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const publiserEmail = req.body.publisherEmail;
    const list: List | undefined = await findListById(listId);

    const updatedPublishers = (list as List).jsonData.publishers.filter(publisher => publisher !== publiserEmail);
    await updateList(
      Number(listId),
      {publishers: updatedPublishers}
    );

    return res.redirect(
      `${dashboardRoutes.listsEdit.replace(
        ":listId",
        `${listId}`
      )}?publisherDeleted=true&publisherEmail=${publiserEmail}`
    );

  } catch (error) {
    next(error);
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
