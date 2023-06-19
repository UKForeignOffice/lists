import { countriesList } from "server/services/metadata";
import { validateCountry } from "server/models/listItem/providers/helpers";
import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
  res.render("lists/find/country", {
    countriesList,
  });
}

export function post(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountry(country);
  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(req.originalUrl);
    return;
  }

  const safe = encodeURIComponent(validatedCountry);

  res.redirect(`${safe.toLowerCase()}/region`);
}
