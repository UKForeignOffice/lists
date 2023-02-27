import { differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";
import { List } from "server/models/types";
import Prisma from "@prisma/client";
import { logger } from "server/services/logger";

interface Meta {
  reference: string;
  weeksUntilUnpublish: number;
}

export function getMetaForList(list: Prisma.List): Meta | undefined {
  const { jsonData } = list as List;
  const { currentAnnualReview } = jsonData;

  if (!currentAnnualReview) {
    logger.error(
      `getMetaForList: list.id ${list.id} does not have a fully qualified currentAnnualReview.keyDates object`
    );
    return;
  }

  const { keyDates } = currentAnnualReview;

  const endDate = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH));

  return {
    reference: jsonData.currentAnnualReview!.reference,
    weeksUntilUnpublish: differenceInWeeks(endDate, startOfToday()),
  };
}
