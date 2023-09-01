import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendEditDetailsEmail } from "server/services/govuk-notify";
import { logger } from "./logger";

export async function sendNewEditEmail({
  listItem,
  message,
}: {
  listItem: ListItemWithAddressCountry;
  message: string;
}) {
  try {
    const changeLink = await initialiseFormRunnerSession({
      list: { type: listItem.type },
      listItem,
      message,
    });
    const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);
    const typePlural = serviceName(listItem.type);
    const { result, error } = await sendEditDetailsEmail(
      contactName,
      contactEmailAddress,
      typePlural,
      message,
      changeLink
    );
    if (error) {
      throw error;
    }
    return result;
  } catch (e) {
    logger.error(`Failed to send email for ${listItem.id}, ${e}`);
    throw e;
  }
}
