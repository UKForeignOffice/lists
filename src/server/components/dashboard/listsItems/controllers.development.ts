import { ListIndexRes } from "server/components/dashboard/listsItems/types";
import { List, AnnualReviewKeyDates } from "server/models/types";
import { formatISO, parseISO, subDays } from "date-fns";

import { prisma } from "server/models/db/prisma-client";
import { Request } from "express";

function subDaysFromISODate(ISODate: string | Date, amount: number) {
  const isString = typeof ISODate === "string";
  const date = isString ? parseISO(ISODate) : ISODate;
  return subDays(date, amount);
}

function createKeyDatesFromISODate(isoDate: string | Date): AnnualReviewKeyDates {
  return {
    POST_ONE_MONTH: subDaysFromISODate(isoDate, 28).toISOString(),
    POST_ONE_WEEK: subDaysFromISODate(isoDate, 7).toISOString(),
    POST_ONE_DAY: subDaysFromISODate(isoDate, 1).toISOString(),
    START: subDaysFromISODate(isoDate, 0).toISOString(),
  };
}

export async function get(req: Request, res: ListIndexRes) {
  if (!req.user?.isAdministrator) {
    req.flash("error", "You do not have the correct permissions to view this page");
    return res.redirect(res.locals.listsEditUrl);
  }

  const { list } = res.locals;

  if (!list) {
    return res.redirect(res.locals.listsEditUrl);
  }

  const jsonData = list.jsonData as List["jsonData"];

  const { nextAnnualReviewStartDate } = list;

  if (!nextAnnualReviewStartDate) {
    req.flash("error", "Set an annual review date first");

    return res.redirect(res.locals.listEditUrl);
  }

  const keyDates =
    jsonData.currentAnnualReview?.keyDates?.annualReview ?? createKeyDatesFromISODate(nextAnnualReviewStartDate);

  return res.render("dashboard/lists-edit-dev", {
    keyDates,
    csrfToken: req.csrfToken(),
  });
}

export async function post(req: Request, res: ListIndexRes) {
  if (!req.user?.isAdministrator) {
    req.flash("You do not have the correct permissions to edit key dates");
    return res.redirect(res.locals.listsEditUrl);
  }

  const { list } = res.locals;

  if (!list) {
    req.flash("error", "There was a problem");
    return res.redirect(res.locals.listsEditUrl);
  }

  const jsonData = list.jsonData as List["jsonData"];
  const { currentAnnualReview } = jsonData;

  const { POST_ONE_MONTH, POST_ONE_WEEK, POST_ONE_DAY, START } = req.body;

  let newDates;

  try {
    newDates = {
      POST_ONE_MONTH: formatISO(new Date(POST_ONE_MONTH)),
      POST_ONE_WEEK: formatISO(new Date(POST_ONE_WEEK)),
      POST_ONE_DAY: formatISO(new Date(POST_ONE_DAY)),
      START: formatISO(new Date(START)),
    };
  } catch (e) {
    req.flash("error", "The date must be a valid ISO Date string for example 2019-09-18 (YYYY-MM-DD)");
    return res.redirect(`${res.locals.listsEditUrl}/development`);
  }

  const updatedCurrentAnnualReview = {
    ...currentAnnualReview,
    keyDates: {
      ...currentAnnualReview?.keyDates,
      annualReview: newDates,
    },
  };

  const result = await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      jsonData: {
        ...jsonData,
        currentAnnualReview: updatedCurrentAnnualReview,
      },
    },
  });

  if (!result) {
    req.flash("error", "Update failed");
    return res.redirect(`${res.locals.listsEditUrl}/development`);
  } //

  req.flash("successBannerMessage", "Key dates update was successful");
  req.flash("successBannerHeading", "Key dates update");

  return res.redirect(`${res.locals.listsEditUrl}/development`);
}
