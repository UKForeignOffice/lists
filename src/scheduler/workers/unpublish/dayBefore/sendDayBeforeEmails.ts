import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendDayBeforeProviderReminder } from "./sendDayBeforeProviderReminder";
import { sendDayBeforePostReminder } from "./sendDayBeforePostReminder";
import { getMetaForList } from "./getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../../types";
import { ListJsonData } from "server/models/types";

export async function sendDayBeforeEmails(list: ListWithCountryName, chosenDate: Date) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendDayBeforeEmails", timeframe: "dayBefore" });

  const meta = getMetaForList(list, chosenDate);
  if (!meta) {
    return;
  }

  if (meta.daysUntilUnpublish !== 1) {
    logger.info(
      `${meta.daysUntilUnpublish} does not match 1 day before unpublish, skipping sendDayBeforeProviderConfirmation and sendUnpublishPostConfirmation`
    );
    return;
  }

  const listItems = await findNonRespondentsForList(list);

  if (!listItems.length) {
    return;
  }

  logger.info(`sending provider email for list items ${listItems.map((listItem) => listItem.id)}`);
  const providerEmailTasks = listItems.map(async (listItem) => await sendDayBeforeProviderReminder(listItem, meta));
  const emailsForProviders = await Promise.allSettled(providerEmailTasks);
  logger.info(
    `Sent ${emailsForProviders.filter((promise) => promise.status === "fulfilled").length} provider emails for list ${
      list.id
    }`
  );

  const listJsonData = list.jsonData as ListJsonData;

  if (!listJsonData.users) {
    return await Promise.allSettled(emailsForProviders);
  }
  // email post
  const postEmailTasks = listJsonData.users.map(
    async (emailAddress) => await sendDayBeforePostReminder(emailAddress, list, listItems.length, meta)
  );
  const emailsForPost = await Promise.allSettled(postEmailTasks);
  logger.info(
    `Sent ${emailsForPost.filter((promise) => promise.status === "fulfilled").length} post emails for list ${list.id}`
  );
  return await Promise.allSettled([...emailsForProviders, ...emailsForPost]);
}
