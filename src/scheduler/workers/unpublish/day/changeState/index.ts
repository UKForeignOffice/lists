import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../../types";
import { ListJsonData } from "server/models/types";
import { unpublishListItems } from "./unpublishListItems";
import { resetAnnualReviewForList } from "./resetAnnualReviewForList";
import { findNonRespondentsForList } from "scheduler/workers/unpublish/day/findNonRespondentsForList";
import { getMetaForList } from "scheduler/workers/unpublish/getMetaForList";

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

  const listItems = await findNonRespondentsForList(list);
  logger.info(`retrieved list items: ${listItems.length}`);
  if (listItems.length) {
    const unpublishedListItems = await unpublishListItems(listItems.map((listItem) => listItem.id));
    logger.info(
      `${unpublishedListItems ? "Could not reset" : "Reset"} annual review state for list items [${listItems.map(
        (listItem) => listItem.id
      )}]`
    );
  }
  await resetAnnualReviewForList(list, meta);
}
