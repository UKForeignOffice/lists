import type { NextFunction, Request, Response } from "express";
import { URLSearchParams } from "url";

export function get(req: Request, res: Response) {
  res.render("lists/find/funeral-directors/insurance.njk");
}

export function post(req: Request, res: Response) {
  const { insurance } = req.body;
  const allowedValues = ["yes", "no"];

  if (!insurance || !allowedValues.includes(insurance)) {
    req.flash("error", "You must select whether the deceased had insurance or not");
    res.redirect("insurance");
    return;
  }

  req.session.answers!.insurance = insurance === "yes";

  if (req.query.return === "results") {
    res.redirect("result");
    return;
  }

  if (insurance === "yes") {
    res.redirect(`insurance/contact-insurance`);
    return;
  }
  res.redirect(`repatriation`);
}
