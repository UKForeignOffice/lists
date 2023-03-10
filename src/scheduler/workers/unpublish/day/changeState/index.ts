import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../../types";
import { ListJsonData } from "server/models/types";
import { unpublishListItems } from "./unpublishListItems";
import { resetAnnualReviewForList } from "./resetAnnualReviewForList";
import { getMetaForList } from "scheduler/workers/unpublish/day/getMetaForList";
import { findListItemsToResetAnnualReview } from "scheduler/workers/unpublish/day/changeState/findListItemsToResetAnnualReview";

export async function changeState(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "changeState" });

  const jsonData = list.jsonData as ListJsonData;
  if (!jsonData?.currentAnnualReview) {
    return;
  }
  const meta = getMetaForList(list);
  if (!meta) {
    return;
  }

  const listItems = await findListItemsToResetAnnualReview(list);
  logger.info(`retrieved list items: ${listItems.length}`);
  if (listItems.length) {
    const unpublishedListItemsTasks = await unpublishListItems(
      listItems.map((listItem) => listItem.id),
      jsonData.currentAnnualReview.reference
    );
    const results = await Promise.allSettled(unpublishedListItemsTasks);

    results
      .filter((result) => result.status !== "fulfilled")
      .forEach((failedResult) => {
        // @ts-ignore
        logger.error(failedResult.reason);
      });

    logger.info(
      `${
        unpublishedListItemsTasks.length ? "Reset" : "Could not reset"
      } annual review state for list items [${listItems.map((listItem) => listItem.id)}]`
    );
  }

  await resetAnnualReviewForList(list, meta);
}
