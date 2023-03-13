import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishReminder } from "./sendUnpublishReminder";
import { getMetaForList } from "./getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../types";

export async function sendEmailsToNonRespondents(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendEmailsToNonRespondents", timeframe: "weekly" });
  const meta = getMetaForList(list);

  if (!meta) {
    throw new Error(`Exiting for list ${list.id}, not enough information to continue`);
  }

  if (meta.weeksUntilUnpublish >= 6) {
    logger.info(`${list.id} has >= 6 weeks until unpublish, skipping sendEmailsToNonRespondents`);
    return;
  }

  const listItems = await findNonRespondentsForList(list);
  const emailsToSend = listItems.map(async (listItem) => await sendUnpublishReminder(listItem, meta));
  const emailsSent = await Promise.allSettled(emailsToSend);

  if (emailsSent.length) {
    logger.info(
      `Sent ${emailsSent.filter((promise) => promise.status === "fulfilled").length} emails for list ${list.id}`
    );
  }

  return await Promise.allSettled(emailsToSend);
}
