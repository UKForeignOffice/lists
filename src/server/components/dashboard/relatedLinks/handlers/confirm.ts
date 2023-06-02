import type { Request, Response } from "express";
import { addRelatedLink } from "../addRelatedLink";
import { logger } from "server/services/logger";

export function get(req: Request, res: Response) {
  const { relatedLinkIndex } = req.params;
  const { text, url } = req.session.relatedLink ?? {};

  if (!text || !url) {
    res.redirect(`${res.locals.listsEditUrl}/related-links/${relatedLinkIndex}`);
    return;
  }

  res.render("dashboard/related-links/confirm", {});
}

export async function post(req: Request, res: Response) {
  const { id } = res.locals.list;
  const { relatedLinkIndex } = req.params;
  const { text, url } = req.session.relatedLink ?? {};

  if (!text || !url) {
    return res.redirect(`/related-links/${relatedLinkIndex}`);
  }

  try {
    const transaction = await addRelatedLink(id, { text, url });
    if (transaction) {
      req.flash("relatedLinkBannerStatus", "success");
      req.flash("relatedLinkBannerHeading", "A related link has been added or updated");
      req.flash("relatedLinkText", text);
      req.flash("relatedLinkUrl", url);
    }
  } catch (e) {
    logger.error(`User ${req.user?.id} attempted to update ${req.originalUrl} failed with ${e}`);

    req.flash("error", `Adding the link ${text} failed`);
  }

  delete req.session.relatedLink;

  res.redirect(`${res.locals.listsEditUrl}`);
}
