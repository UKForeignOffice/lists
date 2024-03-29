import { Request, Response } from "express";
import { handleListItemUpdate } from "./publish";
import { sendPublishedEmail } from "./helpers";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";

export async function update(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const listItem = res.locals.listItem;
  const { listItemUrl, listIndexUrl } = res.locals;

  try {
    const [updatedListItem] = await handleListItemUpdate(listItem.id, userId);
    const jsonData = updatedListItem?.jsonData ?? listItem.jsonData;
    const organisationName = jsonData.organisationName;
    await sendPublishedEmail(updatedListItem as ListItemWithAddressCountry);

    req.flash("successBannerTitle", `${organisationName} has been updated and published`);
    req.flash("successBannerHeading", "Updated and published");
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated.`);
    return res.redirect(listItemUrl);
  }
}
