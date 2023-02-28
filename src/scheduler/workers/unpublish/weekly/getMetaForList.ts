import { differenceInWeeks, format, parseISO, startOfDay, startOfToday } from "date-fns";
import { List } from "server/models/types";
import Prisma from "@prisma/client";
import { logger } from "server/services/logger";
import { Meta } from "./types";

/**
 * {@link https://date-fns.org/v1.28.5/docs/format}
 * - D date
 * - MMMM month in full
 * - YYYY year in full
 */
const DISPLAY_DATE_FORMAT = "d MMMM yyyy";

/**
 * Additional data extracted from `List` to be passed down for each email.
 */
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
    parsedUnpublishDate: format(endDate, DISPLAY_DATE_FORMAT),
  };
}
