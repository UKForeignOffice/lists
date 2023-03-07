import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendDayBeforeProviderConfirmation } from "./sendDayBeforeProviderConfirmation";
import { sendDayBeforePostConfirmation } from "./sendDayBeforePostConfirmation";
import { getMetaForList } from "../getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../../types";
import { ListJsonData } from "server/models/types";

export async function sendDayBeforeEmails(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendDayBeforeEmails" });

  const meta = getMetaForList(list);
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
  const providerEmailTasks = listItems.map(async (listItem) => await sendDayBeforeProviderConfirmation(listItem, meta));
  const emailsForProviders = await Promise.allSettled(providerEmailTasks);
  logger.info(
    `Sent ${emailsForProviders.filter((promise) => promise.status === "fulfilled").length} provider emails for list ${
      list.id
    }`
  );

  let emailsSent = emailsForProviders;
  const listJsonData = list.jsonData as ListJsonData;

  // email post
  if (listJsonData.users) {
    const postEmailTasks = listJsonData.users.map(
      async (emailAddress) => await sendDayBeforePostConfirmation(emailAddress, list, listItems.length, meta)
    );
    const emailsForPost = await Promise.allSettled(postEmailTasks);
    emailsSent = emailsSent.concat(emailsForPost);
    logger.info(
      `Sent ${emailsForPost.filter((promise) => promise.status === "fulfilled").length} post emails for list ${list.id}`
    );
  }
  return await Promise.allSettled(emailsSent);
}
