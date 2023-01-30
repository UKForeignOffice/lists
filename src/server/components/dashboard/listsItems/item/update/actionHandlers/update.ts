import { Request, Response } from "express";
import { handleListItemUpdate } from "server/components/dashboard/listsItems/item/update/actionHandlers/publish";
import { sendPublishedEmail } from "server/components/dashboard/listsItems/item/update/actionHandlers/helpers";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";

export async function update(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const listItem = res.locals.listItem;
  const { listItemUrl, listIndexUrl } = res.locals;

  try {
    const [updatedListItem] = await handleListItemUpdate(listItem.id, userId);
    await sendPublishedEmail(updatedListItem as ListItemWithAddressCountry);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been updated and published`);
    req.flash("successBannerHeading", "Updated and published");
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}
