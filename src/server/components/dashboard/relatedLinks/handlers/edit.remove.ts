import type { Request, Response } from "express";
import { deleteRelatedLink } from "./../deleteRelatedLink";
import { addRelatedLinkUpdateAudit } from "./../addRelatedLinkUpdateAudit";

export async function editRemove(req: Request, res: Response) {
  const { relatedLinkIndex, list, listsEditUrl } = res.locals;
  const relatedLinkToEdit = list.jsonData.relatedLinks[relatedLinkIndex];

  const update = await deleteRelatedLink(list.id, relatedLinkIndex);

  if (update) {
    await addRelatedLinkUpdateAudit(req.user!.id, list.id, "Removed", relatedLinkToEdit);

    req.flash("relatedLinkBannerStatus", "success");
    req.flash("relatedLinkBannerAction", "removed");
    req.flash("relatedLinkText", relatedLinkToEdit.text);
    req.flash("relatedLinkUrl", relatedLinkToEdit.url);
    res.redirect(listsEditUrl);
    return;
  }

  res.redirect(listsEditUrl);
}
