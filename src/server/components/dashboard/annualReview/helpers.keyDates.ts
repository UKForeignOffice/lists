import { addDays, parseISO, subDays } from "date-fns";
import { ScheduledProcessKeyDates } from "server/models/types";
import { INTERVALS_IN_DAYS } from "server/config";
import { prisma } from "server/models/db/prisma-client";
import { ListWithJsonData } from "server/components/dashboard/helpers";
import { logger } from "server/services/logger";

export function subDaysFromISODate(ISODate: string | Date, amount: number) {
  const isString = typeof ISODate === "string";
  const date = isString ? parseISO(ISODate) : ISODate;
  return subDays(date, amount).toISOString();
}

export function addDaysFromISODate(ISODate: string | Date, amount: number) {
  const isString = typeof ISODate === "string";
  const date = isString ? parseISO(ISODate) : ISODate;
  return addDays(date, amount).toISOString();
}

export function createKeyDatesFromISODate(isoDate: string | Date): ScheduledProcessKeyDates {
  return {
    annualReview: {
      POST_ONE_MONTH: subDaysFromISODate(isoDate, INTERVALS_IN_DAYS.post.ONE_MONTH),
      POST_ONE_WEEK: subDaysFromISODate(isoDate, INTERVALS_IN_DAYS.post.ONE_WEEK),
      POST_ONE_DAY: subDaysFromISODate(isoDate, INTERVALS_IN_DAYS.post.ONE_DAY),
      START: subDaysFromISODate(isoDate, 0),
    },
    unpublished: {
      PROVIDER_FIVE_WEEKS: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.ONE_WEEK),
      PROVIDER_FOUR_WEEKS: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.TWO_WEEKS),
      PROVIDER_THREE_WEEKS: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.THREE_WEEKS),
      PROVIDER_TWO_WEEKS: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.FOUR_WEEKS),
      ONE_WEEK: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.FIVE_WEEKS),
      ONE_DAY: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.SIX_WEEKS - 1),
      UNPUBLISH: addDaysFromISODate(isoDate, INTERVALS_IN_DAYS.provider.SIX_WEEKS),
    },
  };
}

export async function updateAnnualReviewWithKeyDates(list: ListWithJsonData, isoDate: string) {
  const { jsonData } = list;
  const { currentAnnualReview } = jsonData;
  let newDates;
  try {
    newDates = createKeyDatesFromISODate(isoDate);
  } catch (e) {
    logger.error(e);
    throw e;
  }

  const updatedCurrentAnnualReview = {
    ...currentAnnualReview,
    keyDates: {
      ...currentAnnualReview?.keyDates,
      ...newDates,
    },
  };

  return await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      nextAnnualReviewStartDate: isoDate,
      jsonData: {
        ...jsonData,
        currentAnnualReview: updatedCurrentAnnualReview,
      },
    },
  });
}
