import { NextFunction, Request, Response } from "express";
import { trim, startCase } from "lodash";
import { parseISO, format, add, isBefore, parse, isValid } from "date-fns";
import { dashboardRoutes } from "./routes";
import { findUserByEmail, findUsers, isAdministrator, updateUser } from "server/models/user";
import { createList, findListById, updateList, updateAnnualReviewDate } from "server/models/list";
import { findFeedbackByType } from "server/models/feedback";
import { List, ServiceType, UserRoles } from "server/models/types";
import { sendAnnualReviewDateChangeEmail } from "server/services/govuk-notify";
import { isGovUKEmailAddress } from "server/utils/validation";
import { QuestionError } from "server/components/lists";
import { authRoutes } from "server/components/auth";
import { countriesList } from "server/services/metadata";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";
import { pageTitles } from "server/components/dashboard/helpers";
import { ListIndexRes } from "server/components/dashboard/listsItems/types";

const DATE_FORMAT = "d MMMM yyyy";
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

    const lists = await req.user!.getLists();
    const isNewUser = !req.user?.isAdministrator() && lists.length === 0;

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

    const user = await findUserByEmail(`${userEmail}`);

    res.render("dashboard/users-edit", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.usersEdit],
      UserRoles,
      user,
      req,
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

  const isEditingSuperAdminUser = await isAdministrator(userEmail);
  if (isEditingSuperAdminUser) {
    // disallow editing of SuperAdmins
    logger.warn(`user ${req.user?.userData.id} attempted to edit super user ${userEmail}`);
    return next(new HttpException(405, "405", "Not allowed to edit super admin account"));
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

    const annualReviewStartDate = formatAnnualReviewDate(list as List, "annualReviewStartDate");
    const lastAnnualReviewStartDate = formatAnnualReviewDate(list as List, "lastAnnualReviewStartDate");

    res.render("dashboard/lists-edit", {
      ...DEFAULT_VIEW_PROPS,
      publisher: { change: changeMsg },
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

    if (newList?.id !== undefined) {
      req.flash("successBannerHeading", "Success");
      req.flash("successBannerMessage", "List created successfully");
      return res.redirect(`${dashboardRoutes.listsEdit.replace(":listId", `${newList.id}`)}`);
    }
  }

  const user = req.user;

  // TODO: rename to "newUser"
  const publisher: string = req.body.publisher;

  if (!publisher || !isGovUKEmailAddress(publisher)) {
    error = {
      field: "publisher",
      text: !publisher
        ? "You must indicated a publisher"
        : "New users can only be example@fco.gov.uk, or example@fcdo.gov.uk",
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

  req.flash("changeMsg", `User ${publisher} has been created`);

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

export async function listPublisherDelete(req: Request, res: ListIndexRes, next: NextFunction): Promise<void> {
  const userEmail = req.body.userEmail;
  const listId = res.locals.list?.id as number;
  const list = await findListById(listId);
  const userHasRemovedOwnEmail = userEmail === req.user?.userData.email;

  if (!list) {
    // TODO: this should never happen. findByListId should probably throw.
    const err = new HttpException(404, "404", "List could not be found.");
    return next(err);
  }

  if (userHasRemovedOwnEmail) {
    const error = {
      field: "publisherList",
      text: "You cannot remove your own email address from a list",
      href: "#publishers",
    };

    return res.render("dashboard/list-edit-confirm-delete-user", {
      ...DEFAULT_VIEW_PROPS,
      listId: list.id,
      userEmail,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  }

  const updatedUsers = list.jsonData?.users?.filter((u) => u !== userEmail) ?? [];

  await updateList(list.id, { users: updatedUsers });

  req.flash("changeMsg", `User ${userEmail} has been removed`);

  return res.redirect(res.locals.listsEditUrl);
}

function formatAnnualReviewDate(list: List, field: string): string {
  return list.jsonData[field] ? format(parseISO(list.jsonData[field] as string), DATE_FORMAT) : "";
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

export async function listsEditAnnualReviewDateController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { listId } = req.params;
    const list = await findListById(listId);
    const annualReviewStartDate = formatAnnualReviewDate(list as List, "annualReviewStartDate");
    const maxDate = list?.jsonData.annualReviewStartDate ? getMaxDate(list) : "";
    const formattedMaxDate = maxDate ? format(maxDate, DATE_FORMAT) : "";
    const helpText = maxDate
      ? `The new date must be before ${formattedMaxDate}`
      : "The new date must be within 6 months of today’s date";

    res.render("dashboard/lists-edit-annual-review-date", {
      ...DEFAULT_VIEW_PROPS,
      error: {
        text: req.flash("annualReviewError")[0],
      },
      annualReviewStartDate,
      maxDate,
      formattedMaxDate,
      list,
      helpText,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    logger.error(`listsEditAnnualReviewDateController Error: ${(error as Error).message}`);
    next(error);
  }
}

function getMaxDate(list: List): Date {
  const lastAnnualReview = list.jsonData.lastAnnualReviewDate ?? list.createdAt;
  const lastAnnualReviewPlusYear = add(lastAnnualReview as Date, { years: 1 });
  const maxDateFromLastAnnualReview = addSixMonths(lastAnnualReviewPlusYear);
  const maxDateFromUserEnteredValues = addSixMonths(list.jsonData.annualReviewStartDate as number);
  const maxDate = isBefore(maxDateFromUserEnteredValues, maxDateFromLastAnnualReview)
    ? maxDateFromUserEnteredValues
    : maxDateFromLastAnnualReview;

  return maxDate;
}

function addSixMonths(date: number | string | Date): Date {
  const annualReviewDate = typeof date === "string" ? new Date(date) : date;
  const newDate = add(annualReviewDate as Date, { months: 6 });

  return newDate;
}

export async function listsEditAnnualReviewDatePostController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    return req.body.action === "confirmNewDate"
      ? await confirmNewAnnualReviewDate(req, res)
      : await updateNewAnnualReviewDate(req, res);
  } catch (error) {
    logger.error(`listsEditAnnualReviewDatePostController Error: ${(error as Error).message}`);
    next(error);
  }
}

async function confirmNewAnnualReviewDate(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const list = (await findListById(listId)) as List;
  const { day, month } = req.body;
  const annualReviewDate = getAnnualReviewDate({ day, month, list });

  if (!annualReviewDate.isValid) {
    req.flash("annualReviewError", annualReviewDate.errorMsg);
    return res.redirect(`${dashboardRoutes.listsEditAnnualReviewDate.replace(":listId", list.id.toString())}`);
  }

  return res.render("dashboard/lists-edit-annual-review-date-confirm", {
    ...DEFAULT_VIEW_PROPS,
    newAnnualReviewDateFormatted: format(annualReviewDate.value as Date, DATE_FORMAT),
    newAnnualReviewDate: annualReviewDate.value,
    list,
    csrfToken: getCSRFToken(req),
  });
}

export function getAnnualReviewDate({ day, month, list }: { day: string; month: string; list: List }): {
  isValid: boolean;
  value: Date | null;
  errorMsg: string;
} {
  const lastAnnualReview = list.jsonData.lastAnnualReviewDate ?? list.createdAt;

  const annualReviewYear = getAnnualReviewYear({
    day,
    month,
    lastAnnualReview: (list.jsonData.annualReviewStartDate ?? lastAnnualReview) as number,
  });
  const parsedDate = parse(`${month}/${day}/${annualReviewYear}`, "P", new Date());

  const maxDate = getMaxDate(list);

  const invalidResult = { isValid: false, value: null };
  const isLeapYear = (): boolean => month === "2" && day === "29";
  let errorMsg = "";

  if (!maxDate) throw new Error("confirmNewAnnualReviewDate Error: Max date could not be calculated");

  if (!month || !day) {
    errorMsg = "Enter a date for the annual review";
    return { ...invalidResult, errorMsg };
  }

  if (isLeapYear() || !isValid(parsedDate)) {
    errorMsg = "You cannot set the annual review to this date. Please choose another";
    return { ...invalidResult, errorMsg };
  }

  if (!isBefore(parsedDate, maxDate)) {
    errorMsg = "You can only change the date up to 6 months after the current review date";
    return { ...invalidResult, errorMsg };
  }

  return { isValid: true, value: parsedDate, errorMsg };
}

function getAnnualReviewYear({
  day,
  month,
  lastAnnualReview,
}: {
  day?: string;
  month?: string;
  lastAnnualReview: number;
}): number {
  const date = new Date(lastAnnualReview);

  if (!day || !month) return date.getFullYear();

  const userEnteredDate = new Date(`${month}/${day}/${date.getFullYear()}`);

  return isBefore(userEnteredDate, date) ? date.getFullYear() + 1 : date.getFullYear();
}

async function updateNewAnnualReviewDate(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const list = (await findListById(listId)) as List;
  const { newAnnualReviewDate } = req.body;
  const newAnnualReviewDateFormatted = new Date(newAnnualReviewDate as string);
  const annualReviewDate = format(newAnnualReviewDateFormatted, DATE_FORMAT);

  await updateAnnualReviewDate(listId, newAnnualReviewDateFormatted.toISOString());

  for (const emailAddress of list.jsonData.publishers as string[]) {
    await sendAnnualReviewDateChangeEmail({
      emailAddress,
      serviceType: startCase(list.type),
      country: list.country!.name!,
      annualReviewDate,
    });
  }

  return res.redirect(
    `${dashboardRoutes.listsEdit.replace(":listId", list.id.toString())}?annualReviewDateUpdated=true`
  );
}
