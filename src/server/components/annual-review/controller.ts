import { Request, Response, NextFunction } from "express";
import { startCase } from "lodash";
import { Status } from "@prisma/client";
import { add, isPast } from "date-fns";

import * as Types from "../dashboard/listsItems/types";
import { findListItemByReference } from "server/models/listItem/listItem";
import { getDetailsViewModel } from "server/components/dashboard/listsItems/getViewModel";
import { getCSRFToken } from "server/components/cookies/helpers";
import { HttpException } from "server/middlewares/error-handlers";
import { prisma } from "server/models/db/prisma-client";

import type { ListItemGetObject, List } from "server/models/types";

export async function confirmGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listItemRef } = req.params;
    const listItem = (await findListItemByReference(listItemRef)) as ListItemGetObject;
    const rows = formatDataForSummaryRows(listItem);
    const errorMsg = req.flash("annualReviewError")[0];
    const userHasConfirmed = listItem.status === Status.ANNUAL_REVIEW; // CHECK_ANNUAL_REVIEW
    let error = null;

    if (await dateHasExpired(listItem.id)) {
      res.redirect("/annual-review/error?expired=true");
    }

    if (userHasConfirmed) {
      res.redirect("/annual-review/error?confirmed=true");
    }

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

async function dateHasExpired(listId: number): Promise<boolean | undefined> {
  const listData = await prisma.list.findUnique({
    where: {
      id: Number(listId),
    },
  }) as List;

  // TODO: uncomment after annual review stuff merged in
  // if (!listData?.jsonData?.annualReviewStartDate) {
  //   throw new Error("An annual review start date does not exist");
  // }

  const annualReviewStartDate = new Date(listData?.jsonData?.annualReviewStartDate);
  const maxDate = add(annualReviewStartDate, { weeks: 6 });

  return isPast(maxDate);
}

function formatDataForSummaryRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { organisation, contact, adminUseOnly } = getDetailsViewModel(listItem);
  const mergedRows = [...organisation.rows, ...contact.rows, ...adminUseOnly.rows];

  return mergedRows;
}

export function confirmPostController(req: Request, res: Response): void {
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

export async function declarationPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { confirmation } = req.body;
    const { listItemRef } = req.params;

    if (!confirmation) {
      req.flash("declarationError", "You must select the declaration box to proceed");
      return res.redirect(`/annual-review/declaration/${listItemRef}`);
    }

    const listItem = (await findListItemByReference(listItemRef)) as ListItemGetObject;

    await prisma.listItem.update({
      where: { id: listItem.id },
      data: {
        status: Status.ANNUAL_REVIEW, // CHECK_ANNUAL_REVIEW
      },
    });

    res.redirect("/annual-review/submitted");
  } catch (err) {
    next(err);
  }
}

export function submittedGetController(_: Request, res: Response): void {
  res.render("annual-review/submitted");
}

export function errorGetController(req: Request, res: Response): void {
  const { expired, confirmed } = req.query;

  res.render("annual-review/error", {
    expired,
    confirmed,
  });
}
