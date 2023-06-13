import { relatedLinkSchema } from "./../relatedLinkSchema";
import type { Response, Request } from "express";

export function editContinue(req: Request, res: Response) {
  const { relatedLinkIndex } = res.locals;
  const { text, url } = req.body;

  const { value, error } = relatedLinkSchema.validate(
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

  req.session.relatedLink = {
    text,
    url: value.url ?? url,
  };

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

    res.redirect(`${relatedLinkIndex}`);
    return;
  }

  res.redirect(`${relatedLinkIndex}/confirm`);
}
