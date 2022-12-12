import * as DateFns from "date-fns";
import { startCase } from "lodash";
import { findListById, updateAnnualReviewDate } from "server/models/list";
import { getCSRFToken } from "server/components/cookies/helpers";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import * as Helpers from "server/components/dashboard/annualReview/helpers";
import { sendAnnualReviewDateChangeEmail } from "server/services/govuk-notify";

import type { NextFunction, Request, Response } from "express";
import type { List } from "server/models/types";

export const DATE_FORMAT = "d MMMM yyyy";

export async function editDateGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;
    const list = await findListById(listId);
    const annualReviewStartDate = Helpers.formatAnnualReviewDate(list as List, "annualReviewStartDate");
    const maxDate = list?.jsonData.annualReviewStartDate ? Helpers.getMaxDate(list) : "";
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
      ? await confirmNewAnnualReviewDate(req, res)
      : await updateNewAnnualReviewDate(req, res);
  } catch (error) {
    logger.error(`editDatePostController Error: ${(error as Error).message}`);
    next(error);
  }
}

async function confirmNewAnnualReviewDate(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const list = (await findListById(listId)) as List;
  const { day, month } = req.body;
  const annualReviewDate = Helpers.getAnnualReviewDate({ day, month, list });

  if (!annualReviewDate.value) {
    req.flash("annualReviewError", annualReviewDate.errorMsg!);
    return res.redirect(`${res.locals.listEditUrl}/annual-review-date`);
  }

  return res.render("dashboard/lists-edit-annual-review-date-confirm", {
    ...DEFAULT_VIEW_PROPS,
    newAnnualReviewDateFormatted: DateFns.format(annualReviewDate.value, DATE_FORMAT),
    newAnnualReviewDate: annualReviewDate.value,
    list,
    csrfToken: getCSRFToken(req),
  });
}

async function updateNewAnnualReviewDate(req: Request, res: Response): Promise<void> {
  const { listId } = req.params;
  const list = (await findListById(listId)) as List;
  const { newAnnualReviewDate } = req.body;
  const newAnnualReviewDateFormatted = new Date(newAnnualReviewDate as string);
  const annualReviewDate = DateFns.format(newAnnualReviewDateFormatted, DATE_FORMAT);

  await updateAnnualReviewDate(listId, newAnnualReviewDateFormatted.toISOString());

  // for (const emailAddress of list.jsonData.users ?? []) {
  //   await sendAnnualReviewDateChangeEmail({
  //     emailAddress,
  //     serviceType: startCase(list.type),
  //     country: list.country!.name!,
  //     annualReviewDate,
  //   });
  // }

  req.flash("successBannerHeading", "Success");
  req.flash("successBannerMessage", "Annual review date updated successfully");

  return res.redirect(res.locals.listsEditUrl);
}
