import * as DateFns from "date-fns";
import { startCase } from "lodash";
import { findListById } from "server/models/list";
import { getCSRFToken } from "server/components/cookies/helpers";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import * as Helpers from "server/components/dashboard/annualReview/helpers";
import { sendAnnualReviewDateChangeEmail } from "server/services/govuk-notify";

import type { NextFunction, Request, Response } from "express";
import type { List } from "server/models/types";
import { updateAnnualReviewWithKeyDates } from "server/components/dashboard/annualReview/helpers.keyDates";
import {isAfter, isEqual} from "date-fns";

export const DATE_FORMAT = "d MMMM yyyy";

export async function editDateGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await findListById(res.locals.list.id);
    const annualReviewStartDate = Helpers.formatAnnualReviewDate(list as List, "nextAnnualReviewStartDate");
    const maxDate = list?.jsonData.annualReviewStartDate ? Helpers.getMaxDate() : "";
    const formattedMaxDate = maxDate ? DateFns.format(maxDate, DATE_FORMAT) : "";
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
    logger.error(`editDateGetController Error: ${(error as Error).message}`);
    next(error);
  }
}

export async function editDatePostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    return req.body.action === "confirmNewDate"
      ? await confirmNewAnnualReviewDate(req, res, next)
      : await updateNewAnnualReviewDate(req, res);
  } catch (error) {
    logger.error(`editDatePostController Error: ${(error as Error).message}`);
    next(error);
  }
}

async function confirmNewAnnualReviewDate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id: listId } = res.locals.list;
  const list = (await findListById(listId)) as List;
  const { day, month } = req.body;
  const annualReviewDate = Helpers.getAnnualReviewDate(day, month);

  if (!annualReviewDate.value) {
    req.flash("annualReviewError", annualReviewDate.errorMsg!);
    return res.redirect(`${res.locals.listsEditUrl}/annual-review-date`);
  }

  return res.render("dashboard/lists-edit-annual-review-date-confirm", {
    ...DEFAULT_VIEW_PROPS,
    newAnnualReviewDateFormatted: DateFns.format(annualReviewDate.value, DATE_FORMAT),
    newAnnualReviewDate: annualReviewDate.value.toISOString(),
    list,
    serviceType: startCase(list.type).toLowerCase(),
    csrfToken: getCSRFToken(req),
  });
}

function isUpdateKeyDates(list: List) {
  const currentAnnualReviewStart = list.jsonData.currentAnnualReview?.keyDates.annualReview.START;
  let shouldUpdate = true;
  if (currentAnnualReviewStart) {
    const currentAnnualReviewStartDate = new Date(currentAnnualReviewStart);
    const today = new Date();
    if (isEqual(today, currentAnnualReviewStartDate) || isAfter(today, currentAnnualReviewStartDate)) {
      logger.info(`Annual review already started on ${currentAnnualReviewStartDate.toISOString()}, not updating list.jsonData.currentAnnualReview`);
      shouldUpdate = false;
    }
  }
  return shouldUpdate;
}

async function updateNewAnnualReviewDate(req: Request, res: Response): Promise<void> {
  const { id: listId } = res.locals.list;
  const list = (await findListById(listId)) as List;
  const { newAnnualReviewDate } = req.body;
  const annualReviewDate = new Date(newAnnualReviewDate as string);
  const newAnnualReviewDateFormatted = DateFns.format(annualReviewDate, DATE_FORMAT);

  // check if annual review start date has passed and prevent updating if so
  const isUpdateCurrentAnnualReview = isUpdateKeyDates(list);

  if (isUpdateCurrentAnnualReview) {
    try {
      await updateAnnualReviewWithKeyDates(list, annualReviewDate.toISOString());
    } catch (e) {
      logger.error(e);
      req.flash("error", "There was a problem updating the annual review date");
      return res.redirect(`${res.locals.listsEditUrl}/annual-review-date`);
    }
  }
  for (const emailAddress of list.jsonData.users ?? []) {
    await sendAnnualReviewDateChangeEmail({
      emailAddress,
      serviceType: startCase(list.type),
      country: list.country!.name!,
      annualReviewDate: newAnnualReviewDateFormatted,
    });
  }

  req.flash("successBannerHeading", "Success");
  req.flash("successBannerMessage", "Annual review date updated successfully");

  return res.redirect(res.locals.listsEditUrl);
}
