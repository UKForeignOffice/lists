import { differenceInDays, format, parseISO, startOfDay, startOfToday } from "date-fns";
import { List } from "server/models/types";
import { ListWithCountryName } from "../types";
import { Meta } from "./types";
import { schedulerLogger } from "scheduler/logger";

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
export function getMetaForList(list: ListWithCountryName): Meta | undefined {
  const logger = schedulerLogger.child({ listId: list.id, method: "getMetaForList", timeframe: "dayBefore" });

  const { jsonData } = list as List;
  const { currentAnnualReview } = jsonData;

  if (!currentAnnualReview) {
    logger.error(`list ${list.id} does not have a valid currentAnnualReview.keyDates object`);
    return;
  }

  const { keyDates } = currentAnnualReview;

  const endDate = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH));
  const today = startOfToday();
  const daysUntilUnpublish = differenceInDays(endDate, today);

  return {
    reference: jsonData.currentAnnualReview!.reference,
    daysUntilUnpublish,
    parsedUnpublishDate: format(endDate, DISPLAY_DATE_FORMAT),
    countryName: list.country.name,
  };
}
