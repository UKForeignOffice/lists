import { Request, Response } from "express";
import { archiveListItem } from "server/models/listItem";
import { logger } from "server/services/logger";

export async function archive(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { listItemUrl, listIndexUrl, listItem } = res.locals;
  const changeMessage = req.session.update?.message;

  try {
    await archiveListItem(listItem.id, userId!, changeMessage!);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been archived`);
    req.flash("successBannerHeading", "Archived");
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: unknown) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be archived.`);
    logger.error(`listItem archive: ${error}`);
    return res.redirect(listItemUrl);
  }
}
