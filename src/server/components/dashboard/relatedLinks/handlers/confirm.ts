import type { Request, Response } from "express";
import { updateRelatedLink } from "../updateRelatedLink";
import { logger } from "server/services/logger";
import { addRelatedLinkUpdateAudit } from "./../addRelatedLinkUpdateAudit";

export function get(req: Request, res: Response) {
  const { relatedLinkIndex } = res.locals;
  const { text, url } = req.session.relatedLink ?? {};

  if (!text || !url) {
    res.redirect(`${res.locals.listsEditUrl}/related-links/${relatedLinkIndex}`);
    return;
  }

  res.render("dashboard/related-links/confirm");
}

export async function post(req: Request, res: Response) {
  const { list } = res.locals;
  const { relatedLinkIndex } = res.locals;
  const { text, url } = req.session.relatedLink ?? {};

  console.log(res.locals);

  if (!text || !url) {
    return res.redirect(`/related-links/${relatedLinkIndex}`);
  }

  try {
    const update = {
      text,
      url,
    };
    const transaction = await updateRelatedLink(list.id, update, relatedLinkIndex);

    const isNew = relatedLinkIndex === "new";
    const auditAction = isNew ? "Added" : "Edited";

    await addRelatedLinkUpdateAudit(req.user!.id, list.id, auditAction, {
      ...(!isNew && { before: list.jsonData[relatedLinkIndex] }),
      ...update,
    });

    const action = relatedLinkIndex === "new" ? "added" : "updated";
    if (transaction) {
      req.flash("relatedLinkBannerStatus", "success");
      req.flash("relatedLinkBannerAction", action);
      req.flash("relatedLinkText", text);
      req.flash("relatedLinkUrl", url);
    }
  } catch (e) {
    logger.error(`POST - User ${req.user?.id} attempted to update ${req.originalUrl} failed with ${e}`);

    req.flash("error", `Adding the link ${text} failed`);
  }

  delete req.session.relatedLink;

  res.redirect(`${res.locals.listsEditUrl}`);
}
