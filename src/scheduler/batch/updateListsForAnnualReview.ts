import { addDays } from "date-fns";
import { schedulerMilestoneDays } from "./helpers";
import { findListByAnnualReviewDate } from "server/models/list";
import { logger } from "server/services/logger";
import { populateCurrentAnnualReview } from "./populateCurrentAnnualReview";

export const updateListsForAnnualReview = async (today: Date): Promise<void> => {
  const annualReviewStartDate = addDays(today, schedulerMilestoneDays.post.ONE_MONTH);
  if (annualReviewStartDate) {
    const { result: lists } = await findListByAnnualReviewDate(annualReviewStartDate);

    logger.info(
      `Found the lists ${lists?.map((list) => list.id)} matching annual review start date [${annualReviewStartDate}]`
    );
    if (!lists?.length) {
      return;
    }
    // @ts-ignore
    await populateCurrentAnnualReview(lists);
  }
};
