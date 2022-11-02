import { Request, Response, NextFunction } from "express";
import { startCase } from "lodash";

import * as Types from "../dashboard/listsItems/types";
import { findListItemByReference } from "server/models/listItem/listItem";
import { getDetailsViewModel } from "server/components/dashboard/listsItems/getViewModel";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import type { ListItemGetObject } from "server/models/types";

export async function confirmGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listItemRef } = req.params;
    const listItem = (await findListItemByReference(listItemRef)) as ListItemGetObject;
    const rows = formatDataForSummaryRows(listItem);
    const errorMsg = req.flash("annualReviewError")[0];
    let error = null;

    if (errorMsg) {
      error = { text: errorMsg };
    }

    res.render("annual-review/provider-confirmation", {
      rows,
      country: listItem?.jsonData?.country,
      service: startCase(listItem?.type),
      csrfToken: getCSRFToken(req),
      reference: listItem.reference,
      error,
    });
  } catch (err) {
    next(err);
  }
}

function formatDataForSummaryRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { organisation, contact, adminUseOnly } = getDetailsViewModel(listItem);
  const mergedRows = [...organisation.rows, ...contact.rows, ...adminUseOnly.rows];

  return mergedRows;
}

export function confirmPostController(req: Request, res: Response, next: NextFunction): void {
  const chosenValue = req.body["is-your-information-correct"];

  if (!chosenValue) {
    req.flash("annualReviewError", "Select if your information is correct or if you need to update it");
    return res.redirect(`/annual-review/confirm/${req.body.reference}`);
  }

  if (chosenValue === "yes") {
    return res.redirect(`/annual-review/declaration/${req.body.reference}`);
  }

  if (chosenValue === "no") {
    // To be completed by this ticket https://trello.com/c/RtLpclva/1499-annual-review-list-items-apply-provider-makes-changes-for-annual-review
    return res.redirect("/annual-review/summary-page");
  }
}

export function declarationGetController(req: Request, res: Response, next: NextFunction): void {
  const { listItemRef } = req.params;
  const errorMsg = req.flash("declarationError")[0];
  let error = null;

  if (!listItemRef) {
    const err = new HttpException(403, "403", "You do not have permission to view this page");
    return next(err);
  }

  if (errorMsg) {
    error = { text: errorMsg };
  }

  res.render("annual-review/declaration", { reference: listItemRef, error, csrfToken: getCSRFToken(req) });
}

export function declarationPostController(req: Request, res: Response): void {
  const { confirmation } = req.body;
  const { listItemRef } = req.params;

  if (!confirmation) {
    req.flash("declarationError", "You must tick the declaration box");
    return res.redirect(`/annual-review/declaration/${listItemRef}`);
  }

  // Use prisma to add CHECK_ANNUAL_REVIEW status to listItem
  res.redirect("/annual-review/submitted");
}

export function submittedGetController(_: Request, res: Response): void {
  res.render("annual-review/submitted");
}
