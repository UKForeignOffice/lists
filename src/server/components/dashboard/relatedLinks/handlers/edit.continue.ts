import { relatedLinkSchema } from "./../relatedLinkSchema";
import { type Request, Response } from "express";

export function editContinue(req: Request, res: Response) {
  const { relatedLinkIndex } = res.locals;
  const { text, url } = req.body;


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
