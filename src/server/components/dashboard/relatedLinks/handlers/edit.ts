import type { Request, Response, NextFunction } from "express";
import { editRemove } from "./edit.remove";
import { editContinue } from "./edit.continue";
import { relatedLinksLogger as logger } from "./logger";
export function get(req: Request, res: Response) {
  const relatedLinkErrorSummary = req.flash("relatedLinkErrorSummary") as unknown as string[];

  res.render("dashboard/related-links/edit", {
    relatedLinkErrorSummary: relatedLinkErrorSummary.map((error) => JSON.parse(error)),
  });
}

const POST_ACTIONS = new Map();
POST_ACTIONS.set("remove", editRemove);
POST_ACTIONS.set("continue", editContinue);

export async function postController(req: Request, res: Response, next: NextFunction) {
  const { action }: { action: "continue" | "remove" } = req.body;
  const handler = POST_ACTIONS.get(action);

  if (!handler) {
    logger.warn(`User ${req.user?.id} requested to perform unrecognised ${action} on ${req.originalUrl}`);
    req.flash("error", `There was an error editing the link ${res.locals.relatedLink.text}`);
    res.redirect(`${res.locals.listsEditUrl}`);
  }

  return await handler(req, res, next);
}
