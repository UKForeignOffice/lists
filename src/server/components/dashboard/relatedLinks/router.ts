import express from "express";
import { addRelatedLink } from "server/components/dashboard/relatedLinks/addRelatedLink";
import { logger } from "server/services/logger";
import { relatedLinkSchema } from "server/components/dashboard/relatedLinks/relatedLinkSchema";
import Joi from "joi";
import { RelatedLink } from "shared/types";
import { confirm, edit } from "./handlers";

export const relatedLinksRouter = express.Router();

relatedLinksRouter.param("relatedLinkIndex", (req, res, next) => {
  const { relatedLinkIndex } = req.params;

  const schema = Joi.number().allow("new");
  const { value, error } = schema.validate(relatedLinkIndex);

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
  res.locals.relatedLinkIndex = relatedLinkIndex;
  next();
});

relatedLinksRouter.use("*", (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

relatedLinksRouter.get("/", (req, res, next) => {
  res.redirect(res.locals.listsEditUrl);
});

relatedLinksRouter.get("/:relatedLinkIndex", edit.get);

relatedLinksRouter.post("/:relatedLinkIndex", edit.post);

relatedLinksRouter.get("/:relatedLinkIndex/confirm", confirm.get);

relatedLinksRouter.post("/:relatedLinkIndex/confirm", confirm.post);
