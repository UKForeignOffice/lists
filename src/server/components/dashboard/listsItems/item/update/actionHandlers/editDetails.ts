import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { logger } from "server/services/logger";

import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { User } from "server/models/types";

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
    const formRunnerEditUserUrl = await initialiseFormRunnerSession({ list, listItem, message, isAnnualReview });
    return { result: formRunnerEditUserUrl };
  } catch (error) {
    logger.error(`createEditDetailsURL error: could not initialise a form runner session: ${(error as Error).message}`);
    return { error: error as Error };
  }
}
