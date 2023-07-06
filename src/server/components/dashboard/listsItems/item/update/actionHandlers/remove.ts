import { Request, Response } from "express";
import { deleteListItem } from "server/models/listItem";

export async function remove(req: Request, res: Response) {
  const userId = req.user!.id;
  const { listItemUrl, listIndexUrl, listItem } = res.locals;

  try {
    await deleteListItem(listItem.id, userId);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been removed`);
    req.flash("successBannerHeading", "Removed");
    req.flash("successBannerColour", "red");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated.`);
    return res.redirect(listItemUrl);
  }
}
