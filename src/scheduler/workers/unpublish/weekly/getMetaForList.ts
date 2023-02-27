import { differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";
import { List } from "server/models/types";

interface Meta {
  reference: string;
  weeksUntilUnpublish: number;
}

export function getMetaForList(list: List): Meta {
  const { jsonData } = list;
  const { currentAnnualReview } = jsonData;
  const { keyDates } = currentAnnualReview;

  const endDate = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH));

  return {
    reference: jsonData.currentAnnualReview!.reference,
    weeksUntilUnpublish: differenceInWeeks(endDate, startOfToday()),
  };
}
