import express from "express";

export const relatedLinksRouter = express.Router();

relatedLinksRouter.param("/:relatedLinkIndex", (req, res, next) => {
  const { relatedLinkIndex } = req.params;

  const { list } = res.locals;
  const { relatedLinks = [] } = list.jsonData;

  const relatedLinkToEdit = list.jsonData.relatedLinks[relatedLinkIndex];

  if (!relatedLinkToEdit) {
    next();
  }

  res.locals.relatedLink = relatedLinkToEdit;
});

relatedLinksRouter.use("*", (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

relatedLinksRouter.get("/:relatedLinkIndex", (req, res, next) => {
  res.render("dashboard/related-links/edit");
});

relatedLinksRouter.post("/:relatedLinkIndex", (req, res, next) => {
  // res.render("dashboard/related-links/edit");

  res.redirect(req.originalUrl);
});
