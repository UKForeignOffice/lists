import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { listExists } from "server/components/proxyMiddleware/helpers";
import { countriesList } from "server/services/metadata";

export async function lawyersPostController(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect("/application/lawyers/which-list-of-lawyers");
    return;
  }

  req.session.application = {
    type: "lawyers",
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, "lawyers");

  if (!list) {
    res.redirect("/application/lawyers/not-currently-accepting");
    return;
  }

  res.redirect("/application/lawyers/what-size-is-your-company-or-firm");
}

export function getStartPageController(req: Request, res: Response) {
  const routeUrl = req.path;
  const serviceType = routeUrl.split("/")[2];
  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}

export function getCountriesPageController(req: Request, res: Response) {
  const routeUrl = req.path;
  const serviceType = routeUrl.split("/")[2];
  const pagePath = routeUrl.split("/")[3];

  res.render(`apply/${serviceType}/${pagePath}`, {
    countriesList,
    answer: req.session.application?.country,
  });
}
