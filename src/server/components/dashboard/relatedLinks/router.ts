import express from "express";

export const relatedLinksRouter = express.Router();

relatedLinksRouter.param("relatedLinkIndex", (req, res, next) => {
  const { relatedLinkIndex } = req.params;

  const { list } = res.locals;
  const { relatedLinks = [] } = list.jsonData;

  let relatedLink = {
    relatedLinkIndex,
    ...req.session.relatedLink,
  };

  if (!req.session.relatedLink || relatedLinkIndex === "new") {
    res.locals.relatedLink = relatedLink;
    return next();
  }

  res.locals.relatedLink = { ...relatedLink, ...list.jsonData.relatedLinks[relatedLinkIndex] };
  next();
});

relatedLinksRouter.use("*", (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

relatedLinksRouter.get("/:relatedLinkIndex", (req, res, next) => {
  res.render("dashboard/related-links/edit");
});

relatedLinksRouter.post("/:relatedLinkIndex", (req, res, next) => {
  const { text, url } = req.body;
  const { relatedLinkIndex } = req.params;

  req.session.relatedLink = {
    text,
    url,
  };

  res.redirect(`${relatedLinkIndex}/confirm`);
});

relatedLinksRouter.get("/:relatedLinkIndex/confirm", (req, res, next) => {
  res.locals.relatedLink = { ...res.locals.relatedLink, ...req.session.relatedLink };

  res.render("dashboard/related-links/confirm");
});
