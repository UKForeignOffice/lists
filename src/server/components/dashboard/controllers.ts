import { NextFunction, Request, Response } from "express";
import { compact, get, pick, startCase, toLower, trim } from "lodash";
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
  deleteListItem,
  findListItemById,
  findListItemsForList,
 findIndexListItems,
  togglerListItemIsApproved,
  togglerListItemIsPublished,
} from "server/models/listItem/listItem";
import { findFeedbackByType } from "server/models/feedback";
import {
  CountryName,
  LawyerListItemGetObject,
  LawyerListItemJsonData,
  List,
  ListItemGetObject,
  ServiceType, User,
  UserRoles
} from "server/models/types";
import {
  filterSuperAdminRole,
  getInitiateFormRunnerSessionToken,
  userIsListAdministrator,
  userIsListPublisher,
  userIsListValidator,
} from "./helpers";
import { isCountryNameValid, isGovUKEmailAddress, } from "server/utils/validation";
import { createListSearchBaseLink, QuestionError, } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { sendDataPublishedEmail, sendEditDetailsEmail } from "server/services/govuk-notify";
import serviceName from "server/utils/service-name";
import { getCSRFToken } from "server/components/cookies/helpers";
import { createFormRunnerEditListItemLink, createFormRunnerReturningUserLink } from "server/components/lists/helpers";
import { getNewSessionWebhookData, generateFormRunnerWebhookData } from "server/components/formRunner/helpers";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";

export { listItemsIndexController as listsItemsController } from "./listsItems/listItemsIndexController";

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
    list.id !== listItem.listId
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
    list.id !== listItem.listId
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
      const { contactName, contactEmailAddress } = getListItemContactInformation(updatedListItem);
      const typeName = serviceName(updatedListItem.type);

      await sendDataPublishedEmail(
        contactName,
        contactEmailAddress,
        typeName,
        updatedListItem.address.country.name,
        searchLink
      );
    }

    res.json({ status: "OK", isPublished: updatedListItem.isPublished });
  }
}

export async function handlePublishListItem(
  listItemId: number,
  isPublished: boolean,
  userId: User["id"]
): Promise<void> {
    const updatedListItem = await togglerListItemIsPublished({
      id: listItemId,
      isPublished,
      userId,
    });

    if (updatedListItem.isPublished) {
      const searchLink = createListSearchBaseLink(updatedListItem.type);
      const { contactName, contactEmailAddress } = getListItemContactInformation(updatedListItem);
      const typeName = serviceName(updatedListItem.type);

      await sendDataPublishedEmail(
        contactName,
        contactEmailAddress,
        typeName,
        updatedListItem.address.country.name,
        searchLink
      );
    }

}

// TODO: Ideally all of the checks in the controller should be split off into reusable middleware rather then repeating in each controller
export async function listItemsDeleteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user === undefined) {
      res.redirect(authRoutes.logout);

      return;
    }

    const userId = req.user.userData.id;
    const { listId, listItemId } = req.params;
    const list = await findListById(listId);

    if (list === undefined) {
      res.status(404).send({
        error: {
          message: `Could not find list ${listId}`,
        },
      });

      return;
    }

    const isPublisher = userIsListPublisher(req, list);

    if (!isPublisher) {
      res.status(403).send({
        error: {
          message: "User doesn't have publishing right on this list",
        },
      });

      return;
    }

    const { id } = await findListItemById(listItemId);

    await deleteListItem(id, userId);

    res.json({
      status: "OK",
    });
  } catch (e) {
    next(e);
  }
}

export async function handleDeleteListItem(
  id: number,
  userId: User["id"]
): Promise<void> {
  await deleteListItem(id, userId);
}

export async function listTestController(
  req: Request,
  res: Response
): Promise<void> {

  res.render("dashboard/test", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

export async function listItemGetController(
  req: Request,
  res: Response
): Promise<void> {
  const { listId, listItemId } = req.params;

  const list = await findListById(listId);
  const listItem = await findListItemById(listItemId);

    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      csrfToken: getCSRFToken(req)
    });
  }

async function handleEditListItem(list: List, listItem: LawyerListItemGetObject, isUnderTest: boolean, message: string): Promise<void> {
  const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem, isUnderTest, message);

  // Email applicant
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);
  const listType = serviceName(list?.type ?? "");
  await sendEditDetailsEmail(
    contactName,
    contactEmailAddress,
    listType,
    message,
    formRunnerEditUserUrl,
  );
}

export async function listItemPostController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { message, action } = req.body;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson:LawyerListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";
  const confirmationPages: {[key: string]: string} = {
    publish: "dashboard/list-item-confirm-publish",
    unpublish: "dashboard/list-item-confirm-unpublish",
    requestChanges: "dashboard/list-item-confirm-changes",
    update: "dashboard/list-item-confirm-update",
    pin: "dashboard/list-item-confirm-pin",
    unpin: "dashboard/list-item-confirm-pin",
    remove: "dashboard/list-item-confirm-remove",
  };

  const confirmationPage = confirmationPages[action];

  if (action === "requestChanges") {
    req.session.changeMessage = message;
  }

  res.render(confirmationPage, {
    ...DEFAULT_VIEW_PROPS,
    list,
    listItem,
    message,
    req,
    csrfToken: getCSRFToken(req),
  });
}

export async function listItemPostConfirmationController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId, underTest } = req.params;
  const listItemIdNumber = Number(listItemId);
  const { action } = req.body;
  const userId = req?.user?.userData?.id;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson:LawyerListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";
  const isUnderTest = underTest === "true";

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  let resultMessage: string;
  let resultAction: string;

  try {
    switch (action) {
      case "publish":
      case "unpublish":
        await handlePublishListItem(listItemIdNumber, listItem.isPublished, userId);
        resultAction = `${action}ed`;
        resultMessage = `${listItem.jsonData.organisationName} has been ${resultAction}`;
        break;
      case "requestChanges": {
        const changeMessage: string = req.session?.changeMessage ?? "";
        await handleEditListItem(list, listItem, isUnderTest, changeMessage);
        resultAction = `Requested`;
        resultMessage = `Change request sent to ${listItem.jsonData.organisationName} ${changeMessage}`;
        break;
      }
      case "update":
        resultAction = `Updated and published`;
        resultMessage = `${listItem.jsonData.organisationName} has been updated and published`;
        break;
      case "remove":
        // await handleDeleteListItem(listItemIdNumber, userId);
        resultAction = `Removed`;
        resultMessage = `${listItem.jsonData.organisationName} has been removed`;
        break;
      case "pin":
        resultAction = `Pinned`;
        resultMessage = `${listItem.jsonData.organisationName} has been pinned`;
        break;
      default:
        resultAction = `Invalid action`;
        resultMessage = `${listItem.jsonData.organisationName} could not be updated - invalid action detected`;
        break;
    }

    const listItems = await findListItemsForList(list);

    res.render("dashboard/lists-items", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItems,
      resultAction,
      resultMessage,
      canApprove: userIsListValidator(req, list),
      canPublish: userIsListPublisher(req, list),
      csrfToken: getCSRFToken(req),
    });

  } catch (error) {
    resultMessage = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage,
      csrfToken: getCSRFToken(req)
    });
  }
}

async function initialiseFormRunnerSession(list: List, listItem: ListItemGetObject, isUnderTest: boolean, message: string): Promise<string> {
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(list.type, listItem.id, questions, message);
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(list.type);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);
  const formRunnerEditUserUrl = createFormRunnerEditListItemLink(token);
  return formRunnerEditUserUrl;
}

export async function listItemEditRequestValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listId, listItemId } = req.params;
  const userId = req.user?.userData?.id;

  const list = await findListById(listId);
  const listItem = await findListItemById(listItemId);

  if (userId === undefined) {
    return res.redirect(authRoutes.logout);
  }

  if (list === undefined) {
    res.status(404).send({
      error: {
        message: `Could not find list ${listId}`,
      },
    });

  } else if (listItem === undefined) {
    res.status(404).send({
      error: {
        message: `Could not find list item ${listItemId}`,
      },
    });

  } else if (list?.type !== listItem?.type) {
    res.status(400).send({
      error: {
        message: `Trying to edit a list item which is a different service type to list ${listId}`,
      },
    });

  } else if (list?.id !== listItem?.listId) {
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
  }
  return next();
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
