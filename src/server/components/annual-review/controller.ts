import type { Request, Response, NextFunction } from "express";
import { startCase } from "lodash";
import { Status } from "@prisma/client";
import { add, isPast } from "date-fns";

import type * as Types from "../dashboard/listsItems/types";
import { findListItemByReference } from "server/models/listItem/listItem";
import { getDetailsViewModel } from "server/components/dashboard/listsItems/getViewModel";
import { HttpException } from "server/middlewares/error-handlers";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

import type { ListItemGetObject, List, ListJsonData } from "server/models/types";
import { EVENTS } from "server/models/listItem/listItemEvent";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { sendAnnualReviewCompletedEmailForList } from "server/components/annual-review/helpers";
import type { ListWithJsonData } from "server/components/dashboard/helpers";

export async function confirmGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listItemRef } = req.params;
    const listItem = await findListItemByReference(listItemRef);

    if (!listItem) {
      next(
        new HttpException(
          404,
          "404",
          `The list item with the reference ${listItemRef} cannot be found for the confirmation page`
        )
      );
      return;
    }

    // @ts-ignore
    const rows = formatDataForSummaryRows(listItem);
    const errorMsg = req.flash("annualReviewError")[0];
    let error = null;

    if (!listItem.isAnnualReview || (await dateHasExpired(listItem.listId))) {
      return res.render("annual-review/error", {
        text: { title: "This link has expired", body: "This link has expired" },
      });
    }

    if (listItem.status !== Status.OUT_WITH_PROVIDER && listItem.isAnnualReview) {
      const list = listItem?.list as ListWithJsonData;
      const currentAnnualReview = list?.jsonData?.currentAnnualReview;
      const annualReviewReference = currentAnnualReview?.reference;

      const userAlreadySubmitted = await prisma.event.findFirst({
        where: {
          listItemId: listItem.id,
          type: "CHECK_ANNUAL_REVIEW",
          jsonData: {
            path: ["reference"],
            equals: annualReviewReference,
          },
        },
      });

      if (userAlreadySubmitted) {
        logger.info(
          `listItemId: ${
            listItem.id
          } attempted to resubmit annual review details. Found a previous event with the currentAnnualReview reference ${annualReviewReference} ${JSON.stringify(
            userAlreadySubmitted
          )}`
        );
        return res.render("annual-review/error", {
          text: {
            title: "You have already submitted your annual review",
            body: "The annual review for your business has already been submitted.",
          },
        });
      }
    }

    if (errorMsg) {
      error = { text: errorMsg };
    }

    res.render("annual-review/provider-confirmation", {
      rows,
      country: listItem.address.country.name,
      service: startCase(listItem?.type),
      reference: listItem.reference,
      error,
    });
  } catch (err) {
    next(err);
  }
}

async function dateHasExpired(listId: number): Promise<boolean | undefined> {
  const listData = (await prisma.list.findUnique({
    where: {
      id: Number(listId),
    },
  })) as List;

  if (!listData?.nextAnnualReviewStartDate) {
    throw new Error("An annual review start date does not exist");
  }

  const annualReviewStartDate = new Date(listData?.nextAnnualReviewStartDate);
  const maxDate = add(annualReviewStartDate, { weeks: 6 });

  return isPast(maxDate);
}

function formatDataForSummaryRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { organisation, contact, adminUseOnly } = getDetailsViewModel(listItem);
  const mergedRows = [...organisation.rows, ...contact.rows, ...adminUseOnly.rows];

  return mergedRows;
}

export async function confirmPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chosenValue = req.body["is-your-information-correct"];

    if (!chosenValue) {
      req.flash("annualReviewError", "Select if your information is correct or if you need to update it");
      return res.redirect(`/annual-review/confirm/${req.body.reference}`);
    }

    req.session.updatesRequired = chosenValue === "no";
    return res.redirect(`/annual-review/declaration/${req.body.reference}`);
  } catch (err) {
    next(err);
  }
}

async function redirectToFormRunner(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listItemRef, underTest } = req.params;
  const result = await findListItemByReference(listItemRef);

  if (!result) {
    logger.error(`redirectToFormRunner: List item with reference ${listItemRef} cannot be found`);
    next(new HttpException(404, "404", `List item could be found when trying to redirect.`));
    return;
  }

  const { list, ...listItem } = result;

  const formRunnerEditUserUrl = await initialiseFormRunnerSession({
    list,
    // @ts-ignore
    listItem,
    message: "Correct your information and submit your details again.",
    isUnderTest: Boolean(underTest),
    isAnnualReview: true,
  });

  logger.info(`Generated form runner URL [${formRunnerEditUserUrl}], getting list item contact info.`);
  return res.redirect(formRunnerEditUserUrl);
}

export async function declarationGetController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listItemRef } = req.params;
  const errorMsg = req.flash("declarationError")[0];

  if (!listItemRef) {
    const err = new HttpException(403, "403", "You do not have permission to view this page");
    next(err);
    return;
  }

  const error = errorMsg ? { text: errorMsg } : null;

  try {
    const result = await findListItemByReference(listItemRef);

    if (!result) {
      const notFoundError = new HttpException(
        404,
        "404",
        `The list item with the reference ${listItemRef} cannot be found when trying to show the declaration page`
      );
      next(notFoundError);
      return;
    }

    const listType = result?.list?.type;

    res.render("annual-review/declaration", { reference: listItemRef, listType, error });
  } catch (err) {
    next(err);
  }
}

export async function declarationPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { confirmation } = req.body;
    const { listItemRef } = req.params;
    const { updatesRequired } = req.session;

    if (!confirmation) {
      req.flash("declarationError", "You must select the declaration box to proceed");
      return res.redirect(`/annual-review/declaration/${listItemRef}`);
    }

    if (updatesRequired) {
      await redirectToFormRunner(req, res, next);
      return;
    }

    const result = await findListItemByReference(listItemRef);
    if (!result) {
      next(
        new HttpException(
          404,
          "404",
          `The list item with the reference ${listItemRef} cannot be found when trying to show the declaration page`
        )
      );
      return;
    }

    const list = result.list;
    const currentAnnualReview = (list.jsonData as ListJsonData).currentAnnualReview;
    const annualReviewReference = currentAnnualReview?.reference;

    const updatedListItem = await prisma.listItem.update({
      where: { reference: listItemRef },
      data: {
        status: Status.CHECK_ANNUAL_REVIEW,
        history: {
          create: EVENTS.CHECK_ANNUAL_REVIEW({}, annualReviewReference),
        },
      },
    });
    await sendAnnualReviewCompletedEmailForList(updatedListItem.listId);
    res.redirect("/annual-review/submitted");
  } catch (err) {
    next(err);
  }
}

export function submittedGetController(_: Request, res: Response): void {
  res.render("annual-review/submitted");
}

export function errorGetController(_: Request, res: Response): void {
  res.render("annual-review/error");
}
