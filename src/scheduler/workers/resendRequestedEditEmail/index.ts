import { findListItemsWithRequestedEdit } from "./findRequestedEdit";
import { sendNewEditEmail } from "./sendNewEditEmail";
import { logger } from "./logger";

/**
 * Finds all providers that have been requested an edit and are not in annual review, and sends them a new email.
 */
export async function main() {
  const listItems = await findListItemsWithRequestedEdit();
  const tasks = listItems.map(sendNewEditEmail);
  await Promise.allSettled(tasks);

  logger.info("resendRequestedEditEmail complete");
}
