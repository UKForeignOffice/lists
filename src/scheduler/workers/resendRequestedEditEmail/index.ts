import { findListItemsWithRequestedEdit } from "./findRequestedEdit";
import { sendNewEditEmail } from "./sendNewEditEmail";
import { logger } from "./logger";
import { RESEND_EDIT_REQUEST_EMAIL } from "server/config";

/**
 * Finds all providers that have been requested an edit and are not in annual review, and sends them a new email.
 */
export async function main() {
  logger.info(`resendRequestedEditEmail starting - RESEND_EDIT_REQUEST_EMAIL is ${RESEND_EDIT_REQUEST_EMAIL}`);

  if (!RESEND_EDIT_REQUEST_EMAIL) {
    const listItems = await findListItemsWithRequestedEdit();
    const tasks = listItems.map(sendNewEditEmail);
    await Promise.allSettled(tasks);
  }

  logger.info("resendRequestedEditEmail complete");
}
