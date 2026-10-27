import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { getStringRouteParam } from "server/utils/route-params";

export function get(req: Request, res: Response) {
  const country = req.query.country;
  const serviceType = getStringRouteParam(req.params, "serviceType");
  const validatedCountry = validateCountryLower(country as string | string[]);
  const userRequestedInvalidCountry = country && !validatedCountry;

  if (userRequestedInvalidCountry) {
    res.redirect(`${serviceType}`);
    return;
  }

  if (validatedCountry) {
    res.locals.country = validatedCountry;
    req.session.answers = { country: validatedCountry };
  } else {
    req.session.answers = {};
  }

  if (req.query.restart === "yes") {
    req.session.answers = {};
    res.redirect(serviceType);
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
