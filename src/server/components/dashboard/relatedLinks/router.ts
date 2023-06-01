import express from "express";
import { addRelatedLink } from "server/components/dashboard/relatedLinks/addRelatedLink";
import { logger } from "server/services/logger";
import { relatedLinkSchema } from "server/components/dashboard/relatedLinks/relatedLinkSchema";

export const relatedLinksRouter = express.Router();

relatedLinksRouter.param("relatedLinkIndex", (req, res, next) => {
  const { relatedLinkIndex } = req.params;
  res.locals.relatedLinkIndex = relatedLinkIndex;

  if (relatedLinkIndex === "new") {
    res.locals.relatedLink = req.session.relatedLink;
    next();
  }

  const { list } = res.locals;
  const { relatedLinks = [] } = list.jsonData;
  let relatedLink = relatedLinks[Number(relatedLinkIndex)];

  res.locals.relatedLink = { ...relatedLink, ...req.session.relatedLink };
  res.locals.relatedLinkIndex = relatedLinkIndex;
  next();
});

relatedLinksRouter.use("*", (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

relatedLinksRouter.get("/:relatedLinkIndex", (req, res, next) => {
  const relatedLinkErrorSummary = req.flash("relatedLinkErrorSummary");
  res.render("dashboard/related-links/edit", {
    relatedLinkErrorSummary: relatedLinkErrorSummary.map((error) => JSON.parse(error)),
  });
});

relatedLinksRouter.post("/:relatedLinkIndex", (req, res, next) => {
  const { text, url } = req.body;
  const { relatedLinkIndex } = req.params;

  req.session.relatedLink = {
    text,
    url,
  };

  const { error } = relatedLinkSchema.validate(
    { text, url },
    {
      abortEarly: false,
      errors: {
        wrap: {
          label: false,
        },
      },
    }
  );

  if (error) {
    error.details.forEach((detail) => {
      const { key } = detail.context;
      const error = {
        text: detail.message,
        href: key,
      };
      req.flash("relatedLinkErrorSummary", JSON.stringify(error));
      req.flash(`relatedLinkError_${key}`, detail.message);
    });

    req.session.relatedLink = {
      text,
      url,
    };

    return res.redirect(`${relatedLinkIndex}`);
  }

  res.redirect(`${relatedLinkIndex}/confirm`);
});

relatedLinksRouter.get("/:relatedLinkIndex/confirm", (req, res, next) => {
  const { relatedLinkIndex } = req.params;
  const { text, url } = req.session.relatedLink;
  if (!text || !url) {
    return res.redirect(`${res.locals.listsEditUrl}/related-links/${relatedLinkIndex}`);
  }

  res.render("dashboard/related-links/confirm", {});
});

relatedLinksRouter.post("/:relatedLinkIndex/confirm", async (req, res, next) => {
  const { id } = res.locals.list;
  const { relatedLinkIndex } = req.params;
  const update = req.session.relatedLink;
  if (!update) {
    await res.redirect(`/related-links/${relatedLinkIndex}`);
  }

  try {
    const transaction = await addRelatedLink(id, update);
    if (transaction) {
      req.flash("successBannerHeading", "Success");
      req.flash("successBannerMessage", `The link ${update?.text} was added successfully`);
    }
  } catch (e) {
    logger.error(`User ${req.user?.id} attempted to update ${req.originalUrl} failed with ${e}`);

    req.flash("error", `Adding the link ${update?.text} failed`);
  }

  req.session.relatedLink = {};

  await res.redirect(`${res.locals.listsEditUrl}`);
});
