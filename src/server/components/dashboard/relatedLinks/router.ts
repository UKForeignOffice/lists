import express from "express";
import { confirm, edit, handleRelatedLinkIndexParam } from "./handlers";

export const relatedLinksRouter = express.Router();

relatedLinksRouter.param("relatedLinkIndex", handleRelatedLinkIndexParam);

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
