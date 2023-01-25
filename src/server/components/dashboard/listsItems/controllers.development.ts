import { ListIndexRes } from "server/components/dashboard/listsItems/types";
import { List, ScheduledProcessKeyDates } from "server/models/types";
import { parseISO } from "date-fns";

import { prisma } from "server/models/db/prisma-client";
import { Request } from "express";
import { logger } from "server/services/logger";
import { createKeyDatesFromISODate } from "server/components/dashboard/annualReview/helpers.keyDates";

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
    return res.redirect(res.locals.listsEditUrl);
  }

  const keyDates = jsonData.currentAnnualReview?.keyDates ?? createKeyDatesFromISODate(nextAnnualReviewStartDate);

  return res.render("dashboard/lists-edit-dev", {
    keyDates: flattenKeyDatesObject(keyDates),
    csrfToken: req.csrfToken(),
  });
}

function formatISOString(dateString: string) {
  return parseISO(dateString).toISOString();
}

function parseKeyDatesFromBodyRequest(keyDates: ScheduledProcessKeyDates) {
  const { annualReview, unpublished } = keyDates;
  return {
    annualReview: {
      POST_ONE_MONTH: formatISOString(annualReview.POST_ONE_MONTH),
      POST_ONE_WEEK: formatISOString(annualReview.POST_ONE_WEEK),
      POST_ONE_DAY: formatISOString(annualReview.POST_ONE_DAY),
      START: formatISOString(annualReview.START),
    },
    unpublished: {
      ONE_DAY_UNTIL_UNPUBLISH: formatISOString(unpublished.ONE_DAY_UNTIL_UNPUBLISH),
      PROVIDER_FIVE_WEEKS: formatISOString(unpublished.PROVIDER_FIVE_WEEKS),
      PROVIDER_FOUR_WEEKS: formatISOString(unpublished.PROVIDER_FOUR_WEEKS),
      PROVIDER_THREE_WEEKS: formatISOString(unpublished.PROVIDER_THREE_WEEKS),
      PROVIDER_TWO_WEEKS: formatISOString(unpublished.PROVIDER_TWO_WEEKS),
      PROVIDER_ONE_WEEK: formatISOString(unpublished.PROVIDER_ONE_WEEK),
      UNPUBLISH: formatISOString(unpublished.UNPUBLISH),
    },
  };
}

function flattenKeyDatesObject(keyDates: ScheduledProcessKeyDates) {
  return {
    "annualReview[POST_ONE_MONTH]": keyDates.annualReview.POST_ONE_MONTH,
    "annualReview[POST_ONE_WEEK]": keyDates.annualReview.POST_ONE_WEEK,
    "annualReview[POST_ONE_DAY]": keyDates.annualReview.POST_ONE_DAY,
    "annualReview[START]": keyDates.annualReview.START,
    "unpublished[ONE_DAY_UNTIL_UNPUBLISH]": keyDates.unpublished.ONE_DAY_UNTIL_UNPUBLISH,
    "unpublished[PROVIDER_FIVE_WEEKS]": keyDates.unpublished.PROVIDER_FIVE_WEEKS,
    "unpublished[PROVIDER_FOUR_WEEKS]": keyDates.unpublished.PROVIDER_FOUR_WEEKS,
    "unpublished[PROVIDER_THREE_WEEKS]": keyDates.unpublished.PROVIDER_THREE_WEEKS,
    "unpublished[PROVIDER_TWO_WEEKS]": keyDates.unpublished.PROVIDER_TWO_WEEKS,
    "unpublished[PROVIDER_ONE_WEEK]": keyDates.unpublished.PROVIDER_ONE_WEEK,
    "unpublished[UNPUBLISH]": keyDates.unpublished.UNPUBLISH,
  };
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

  let newDates;

  try {
    newDates = parseKeyDatesFromBodyRequest(req.body);
  } catch (e) {
    logger.error(e);
    req.flash("error", "The date must be a valid ISO Date string for example 2019-09-18 (YYYY-MM-DD)");
    return res.redirect(`${res.locals.listsEditUrl}/development`);
  }

  const updatedCurrentAnnualReview = {
    ...currentAnnualReview,
    keyDates: {
      ...currentAnnualReview?.keyDates,
      ...newDates,
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
