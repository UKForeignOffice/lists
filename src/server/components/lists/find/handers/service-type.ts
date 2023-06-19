import type { Request, Response } from "express";
import { formatCountryParam } from "../../helpers";

export function get(req: Request, res: Response) {
  const country = req.query.country;
  if (country) {
    res.locals.country = formatCountryParam(country as string);
  }

  res.render("lists/find/lawyers/notice");
}

export function post(req: Request, res: Response) {
  req.session.answers = {
    ...req.session.answers,
    disclaimer: true,
  };

  res.redirect("/country");
}
