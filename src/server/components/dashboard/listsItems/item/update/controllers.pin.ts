import { Request, Response } from "express";
import { logger } from "server/services/logger";
import { handlePinListItem } from "server/components/dashboard/listsItems/controllers";

export async function listItemPinController(req: Request, res: Response) {
  const { action } = req.body;
  const userId = req.user!.userData.id;
  const listItem = res.locals.listItem!;
  const isPinned = action === "pin";
  const { listItemUrl, listIndexUrl } = res.locals;

  try {
    await handlePinListItem(listItem.id, userId, isPinned);

    req.flash(
      "successBannerTitle",
      `${listItem.jsonData.organisationName} has been ${isPinned ? "pinned" : "unpinned"}`
    );
    req.flash("successBannerHeading", `${isPinned ? "Pinned" : "Unpinned"}`);
    req.flash("successBannerColour", "blue");
    return res.redirect(listIndexUrl);
  } catch (error) {
    logger.error(`listItemPinController: ${userId} failed to ${action} user, ${error}`);
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${(error as Error).message}`);
    return res.redirect(listItemUrl);
  }
}
