import type { Request, Response } from "express";
import { relatedLinkSchema } from "../relatedLinkSchema";

export function get(req: Request, res: Response) {
  const relatedLinkErrorSummary = req.flash("relatedLinkErrorSummary") as unknown as string[];

  res.render("dashboard/related-links/edit", {
    relatedLinkErrorSummary: relatedLinkErrorSummary.map((error) => JSON.parse(error)),
  });
}

export function post(req: Request, res: Response) {
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
      const { key } = detail.context!;
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

    res.redirect(`${relatedLinkIndex}`);
    return;
  }

  res.redirect(`${relatedLinkIndex}/confirm`);
}
