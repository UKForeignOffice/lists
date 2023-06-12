import Joi from "joi";
import type { Request, Response, NextFunction } from "express";

export function handleRelatedLinkIndexParam(req: Request, res: Response, next: NextFunction) {
  const { relatedLinkIndex } = req.params;

  const schema = Joi.number().allow("new");
  const { value, error } = schema.validate(relatedLinkIndex);
  res.locals.relatedLinkIndex = value;

  if (error) {
    return res.redirect(res.locals.listsEditUrl);
  }

  res.locals.relatedLinkIndex = relatedLinkIndex;

  if (relatedLinkIndex === "new") {
    res.locals.relatedLink = req.session.relatedLink;
    return next();
  }

  const { relatedLinks = [] } = res.locals.list.jsonData;
  const relatedLink = relatedLinks[value];

  if (!relatedLink) {
    return res.redirect("new");
  }

  res.locals.relatedLink = { ...relatedLink, ...req.session.relatedLink };
  next();
}
