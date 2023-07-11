import type { Request, Response } from "express";
import { formatCountryParam } from "../../helpers";

export function get(req: Request, res: Response) {
  const country = req.query.country;
  const { serviceType } = req.params;
  if (country) {
    res.locals.country = formatCountryParam(country as string);
  }

  if (req.query.restart === "yes") {
    req.session.answers = {};
    res.redirect(`${req.params.serviceType}`);
    return;
  }

  res.render(`lists/find/${serviceType}/notice`, {
    answers: req.session.answers,
  });
}

export function post(req: Request, res: Response) {
  req.session.answers = {
    ...req.session.answers,
    notice: true,
  };

  res.redirect("/country");
}
