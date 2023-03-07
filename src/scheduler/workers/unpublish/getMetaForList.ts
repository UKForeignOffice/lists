import { differenceInDays, differenceInWeeks, format, parseISO, startOfDay, startOfToday } from "date-fns";
import { List } from "server/models/types";
import { logger } from "server/services/logger";
import { ListWithCountryName, Meta } from "../types";

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
  const { jsonData } = list as List;
  const { currentAnnualReview } = jsonData;

  if (!currentAnnualReview) {
    logger.error(
      `getMetaForList: list.id ${list.id} does not have a fully qualified currentAnnualReview.keyDates object`
    );
    return;
  }

  const { keyDates } = currentAnnualReview;

  const startDate = startOfDay(parseISO(keyDates.annualReview.START));
  const today = startOfToday();
  const endDate = parseISO(keyDates.unpublished.UNPUBLISH);
  const daysUntilUnpublish = differenceInDays(endDate, today);

  return {
    reference: jsonData.currentAnnualReview!.reference,
    daysUntilUnpublish,
    weeksUntilUnpublish: differenceInWeeks(endDate, startOfToday()),
    weeksSinceStart: differenceInWeeks(today, startDate, { roundingMethod: "floor" }),
    parsedUnpublishDate: format(endDate, DISPLAY_DATE_FORMAT),
    countryName: list.country.name,
  };
}
