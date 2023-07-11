import { prisma } from "scheduler/prismaClient";
import { addYears } from "date-fns";
import { schedulerLogger } from "scheduler/logger";

import type { List } from "@prisma/client";
import type { ListJsonData } from "shared/types";
import type { Meta } from "../types";

export async function resetAnnualReviewForList(list: List, meta: Meta) {
  const logger = schedulerLogger.child({ listId: list.id, method: "resetAnnualReviewForList", timeframe: "day" });

  const jsonData = list.jsonData as ListJsonData;
  delete jsonData.currentAnnualReview;
  const currentNextAnnualReviewDate = list.nextAnnualReviewStartDate as Date;

  const updatedList = await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      isAnnualReview: false,
      lastAnnualReviewStartDate: currentNextAnnualReviewDate,
      nextAnnualReviewStartDate: addYears(currentNextAnnualReviewDate, 1),
      jsonData,
    },
  });
  logger.info(`Reset annual review state for list ${list.id}`);

  // TODO: Do we have annual revew events for lists?
  // await addAudit(
  //   {
  //     eventName: "endAnnualReview",
  //     itemId: list.id,
  //     annualReviewRef: meta.reference,
  //   },
  //   AuditEvent.ANNUAL_REVIEW
  // );

  return updatedList;
}
