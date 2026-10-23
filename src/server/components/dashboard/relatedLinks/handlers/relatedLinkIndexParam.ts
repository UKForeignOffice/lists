import Joi from "joi";
import type { Request, Response, NextFunction } from "express";
import { getStringRouteParam } from "server/utils/route-params";

export function handleRelatedLinkIndexParam(req: Request, res: Response, next: NextFunction) {
  const relatedLinkIndex = getStringRouteParam(req.params, "relatedLinkIndex");

  const schema = Joi.number().allow("new");
  const { value, error } = schema.validate(relatedLinkIndex);
  res.locals.relatedLinkIndex = value;

  if (error) {
    res.redirect(res.locals.listsEditUrl);
    return;
  }

  res.locals.relatedLinkIndex = relatedLinkIndex;

  if (relatedLinkIndex === "new") {
    res.locals.relatedLink = req.session.relatedLink;
    next();
    return;
  }

  const { relatedLinks = [] } = res.locals.list.jsonData;
  const relatedLink = relatedLinks[value];

  if (!relatedLink) {
    res.redirect("new");
    return;
  }

  res.locals.relatedLink = { ...relatedLink, ...req.session.relatedLink };
  next();
}
