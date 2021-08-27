import { NextFunction, Request, Response } from "express";
import { startCase, toLower, trim, pick, compact, noop, get } from "lodash";
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
import {
  findListItemsForList,
  findListItemById,
  togglerListItemIsApproved,
  togglerListItemIsPublished,
  getListItemContactInformation,
} from "server/models/listItem";
import { findFeedbackByType } from "server/models/feedback";
import { UserRoles, ServiceType, List } from "server/models/types";
import {
  filterSuperAdminRole,
  userIsListPublisher,
  userIsListValidator,
  userIsListAdministrator,
} from "./helpers";
import {
  isGovUKEmailAddress,
  isCountryNameValid,
} from "server/utils/validation";
import {
  createListSearchBaseLink,
  QuestionError,
} from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { sendDataPublishedEmail } from "server/services/govuk-notify";

const DEFAULT_VIEW_PROPS = {
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

    res.render("dashboard/dashboard.html", {
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
    res.render("dashboard/users-list.html", {
      ...DEFAULT_VIEW_PROPS,
      users,
      req,
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

    res.render("dashboard/users-edit.html", {
      ...DEFAULT_VIEW_PROPS,
      UserRoles,
      userSaved,
      user,
      req,
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

    res.render("dashboard/lists.html", {
      ...DEFAULT_VIEW_PROPS,
      req,
      lists,
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

    res.render("dashboard/lists-edit.html", {
      ...DEFAULT_VIEW_PROPS,
      listCreated,
      listUpdated,
      listId,
      isPost,
      error,
      list,
      req,
    });
  } catch (error) {
    next(error);
  }
}

export async function listsItemsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const list = await findListById(listId);

    if (list === undefined) {
      return next();
    }

    const listItems = await findListItemsForList(list);

    res.render("dashboard/lists-items.html", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItems,
      canApprove: userIsListValidator(req, list),
      canPublish: userIsListPublisher(req, list),
    });
  } catch (error) {
    next(error);
  }
}

// TODO: test
export async function listItemsApproveController(
  req: Request,
  res: Response
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { isApproved } = req.body;
  const userId = req.user?.userData.id;

  if (userId === undefined) {
    return res.redirect(authRoutes.logout);
  }

  const list = await findListById(listId);
  const listItem = await findListItemById(listItemId);

  if (list === undefined) {
    res.status(400).send({
      error: {
        message: `Could not find list ${listId}`,
      },
    });
  } else if (listItem === undefined) {
    res.status(400).send({
      error: {
        message: `Could not find list item ${listItemId}`,
      },
    });
  } else if (
    list.type !== listItem?.type ||
    list.countryId !== listItem.address.country.id
  ) {
    res.status(403).send({
      error: {
        message: `Trying to edit a list item which does not belong to list ${listId}`,
      },
    });
  } else if (!userIsListValidator(req, list)) {
    res.status(400).send({
      error: {
        message: "User doesn't have approving right on this list",
      },
    });
  } else {
    const updatedListItem = await togglerListItemIsApproved({
      id: listItem.id,
      isApproved,
      userId,
    });
    res.json({ status: "OK", isApproved: updatedListItem.isApproved });
  }
}

// TODO: test
export async function listItemsPublishController(
  req: Request,
  res: Response
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { isPublished } = req.body;
  const userId = req.user?.userData.id;

  if (userId === undefined) {
    return res.redirect(authRoutes.logout);
  }

  const list = await findListById(listId);
  const listItem = await findListItemById(listItemId);

  if (list === undefined) {
    res.status(400).send({
      error: {
        message: `Could not find list ${listId}`,
      },
    });
  } else if (listItem === undefined) {
    res.status(400).send({
      error: {
        message: `Could not find list item ${listItemId}`,
      },
    });
  } else if (
    list.type !== listItem?.type ||
    list.countryId !== listItem.address.country.id
  ) {
    res.status(400).send({
      error: {
        message: `Trying to edit a list item which does not belong to list ${listId}`,
      },
    });
  } else if (!userIsListPublisher(req, list)) {
    res.status(403).send({
      error: {
        message: "User doesn't have publishing right on this list",
      },
    });
  } else if (!listItem.isApproved) {
    res.status(400).send({
      error: {
        message: "List item must be approved before publishing",
      },
    });
  } else {
    const updatedListItem = await togglerListItemIsPublished({
      id: listItem.id,
      isPublished,
      userId,
    });

    if (updatedListItem.isPublished) {
      const searchLink = createListSearchBaseLink(updatedListItem.type);
      const { contactName, contactEmailAddress } =
        getListItemContactInformation(updatedListItem);
      sendDataPublishedEmail(
        contactName,
        contactEmailAddress,
        searchLink
      ).catch(noop);
    }

    res.json({ status: "OK", isPublished: updatedListItem.isPublished });
  }
}

// TODO: test
export async function feedbackController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const feedbacksList = await findFeedbackByType("serviceFeedback");
    console.log(JSON.stringify(feedbacksList, null, 2));
    res.render("dashboard/feedbacks-list.html", {
      ...DEFAULT_VIEW_PROPS,
      feedbacksList,
      req,
    });
  } catch (error) {
    next(error);
  }
}
