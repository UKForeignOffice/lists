import { Request, Response } from "express";
import { handleListItemUpdate } from "./publish";
import { sendPublishedEmail } from "./helpers";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import { startCase } from "lodash";

export async function update(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const listItem = res.locals.listItem;
  const { listItemUrl, listIndexUrl } = res.locals;
  const isUpdateNew = req.session.update?.action === "updateNew";
  const updateTypeMessage = isUpdateNew ? "published" : "updated and published";

  try {
    const [updatedListItem] = await handleListItemUpdate(listItem.id, userId);
    const jsonData = updatedListItem?.jsonData ?? listItem.jsonData;
    const organisationName = jsonData.organisationName;
    await sendPublishedEmail(updatedListItem as ListItemWithAddressCountry);

    req.flash("successBannerTitle", `${organisationName} has been ${updateTypeMessage}`);
    req.flash("successBannerHeading", startCase(updateTypeMessage));
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}
