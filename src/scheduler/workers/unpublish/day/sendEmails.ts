import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishProviderConfirmation } from "./sendUnpublishProviderConfirmation";
import { sendUnpublishPostConfirmation } from "./sendUnpublishPostConfirmation";
import { getMetaForList } from "./getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../types";
import { ListJsonData } from "server/models/types";

export async function main(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendEmails", timeframe: "day" });
  const meta = getMetaForList(list);
  if (!meta) {
    return;
  }

  if (meta.daysUntilUnpublish > 0) {
    logger.info(
      `${meta.daysUntilUnpublish} does not match 0 day before unpublish, skipping sendEmailsToNonRespondents`
    );
    return;
  }

  const listItems = await findNonRespondentsForList(list);

  if (!listItems.length) {
    return;
  }

  logger.info(`sending provider email for list items ${listItems.map((listItem) => listItem.id)}`);
  const emailsForProviders = listItems.map(async (listItem) => await sendUnpublishProviderConfirmation(listItem, meta));

  const listJsonData = list.jsonData as ListJsonData;

  if (!listJsonData.users) {
    return await Promise.allSettled(emailsForProviders);
  }
  // email post
  const emailsForPost = listJsonData.users.map(
    async (emailAddress) => await sendUnpublishPostConfirmation(emailAddress, list, listItems.length, meta)
  );
  return await Promise.allSettled([...emailsForProviders, ...emailsForPost]);
}
