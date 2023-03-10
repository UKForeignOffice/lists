import { prisma } from "server/models/db/prisma-client";
import { AuditEvent, List } from "@prisma/client";
import { ListJsonData } from "server/models/types";
import { addYears } from "date-fns";
import {
  addUnpublishPostReminderAudit
} from "scheduler/workers/unpublish/day/changeState/addUnpublishPostReminderAudit";
import { Meta } from "scheduler/workers/unpublish/day/types";
import { schedulerLogger } from "scheduler/logger";

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

  await addUnpublishPostReminderAudit(
    {
      eventName: "endAnnualReview",
      itemId: list.id,
      annualReviewRef: meta.reference,
    },
    AuditEvent.ANNUAL_REVIEW
  );

  return updatedList;
}
