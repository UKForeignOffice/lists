import type { Request, Response } from "express";
import { URLSearchParams } from "url";

export function get(req: Request, res: Response) {
  res.render("lists/find/disclaimer");
}

export function post(req: Request, res: Response) {
  if (req.body.readDisclaimer !== "on") {
    req.flash("error", "You must accept the disclaimer to use this service");
    res.redirect(req.originalUrl);
    return;
  }

  req.session.answers!.disclaimer = true;

  // @ts-ignore
  const params = new URLSearchParams({
    ...req.query,
  }).toString();

  res.redirect(`result?${params}`);
}
