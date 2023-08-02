import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { logger } from "server/services/logger";

import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { User } from "server/models/types";
import { SERVICE_DOMAIN, isLocalHost } from "server/config";

interface EditDetailsInput {
  listItem: ListItemWithAddressCountry;
  message: string;
  userId: User["id"];
  isAnnualReview: boolean;
}
export async function createEditDetailsURL({ listItem, message, userId, isAnnualReview }: EditDetailsInput) {
  logger.info(`user with id: ${userId} is editing details for list item with id: ${listItem.id}`);
  const list = { type: listItem.type };

  try {
    const title = "Change provider details";
    const protocol = isLocalHost ? "http" : "https";
    const redirectUrl = `${protocol}://${SERVICE_DOMAIN}/dashboard/lists/${listItem.listId}/items/${listItem.id}`;
    const formRunnerEditUserUrl = await initialiseFormRunnerSession({
      list,
      listItem,
      message,
      isAnnualReview,
      title,
      redirectUrl,
      isPostEdit: true,
    });
    return { result: formRunnerEditUserUrl };
  } catch (error) {
    logger.error(`createEditDetailsURL error: could not initialise a form runner session: ${(error as Error).message}`);
    return { error: error as Error };
  }
}
