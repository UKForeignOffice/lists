import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";

export function get(req: Request, res: Response) {
  const country = req.query.country;
  const { serviceType } = req.params;
  const validatedCountry = validateCountryLower(country as string | string[]);
  const userRequestedInvalidCountry = country && !validatedCountry;

  if (userRequestedInvalidCountry) {
    res.redirect(`${serviceType}`);
    return;
  }

  if (validatedCountry) {
    res.locals.country = validatedCountry;
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
