import type { Request, Response } from "express";
import { formatCountryParam } from "../../helpers";

export function get(req: Request, res: Response) {
  const country = req.query.country;
  if (country) {
    res.locals.country = formatCountryParam(country as string);
  }

  if (req.query.restart === "yes") {
    req.session.answers = {};
    res.redirect(`${req.params.serviceType}`);
    return;
  }

  res.render("lists/find/lawyers/notice");
}

export function post(req: Request, res: Response) {
  req.session.answers = {
    ...req.session.answers,
    notice: true,
  };

  res.redirect("/country");
}
