import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishProviderConfirmation } from "./sendUnpublishProviderConfirmation";
import { sendUnpublishPostConfirmation } from "./sendUnpublishPostConfirmation";
import { getMetaForList } from "./getMetaForList";
import { schedulerLogger } from "scheduler/logger";

import type { ListWithCountryName } from "../types";
import type { User } from "@prisma/client";

type List = ListWithCountryName & {
  users: Array<Pick<User, "email">>;
};
export async function main(list: List) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendEmails", timeframe: "day" });
  const meta = getMetaForList(list);
  if (!meta) {
    return;
  }

  if (meta.daysUntilUnpublish <= 0) {
    logger.info(
      `${meta.daysUntilUnpublish} does not match 0 day before unpublish, skipping sendEmailsToNonRespondents`
    );
    return;
  }

  const listItems = await findNonRespondentsForList(list);

  if (!listItems.length) {
    return;
  }

  logger.info(`sending unpublish provider email for list items ${listItems.map((listItem) => listItem.id)}`);
  const emailsForProviders = listItems.map(async (listItem) => await sendUnpublishProviderConfirmation(listItem, meta));

  const providerEmails = Promise.allSettled(emailsForProviders);
  // email post

  const numberNotResponded = listItems.length;
  const postEmails = await sendUnpublishPostConfirmation(list, numberNotResponded, meta);
  return await Promise.allSettled([providerEmails, postEmails]);
}
