import { Request, Response } from "express";
import { archiveListItem } from "server/models/listItem";

export async function archive(req: Request, res: Response): Promise<void> {
  const userId = req?.user?.userData?.id;
  const { listItemUrl, listIndexUrl, listItem } = res.locals;
  const { reason } = req.body;

  try {
    await archiveListItem(listItem.id, userId!, reason);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been archived`);
    req.flash("successBannerHeading", "Archived");
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be archived. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}
