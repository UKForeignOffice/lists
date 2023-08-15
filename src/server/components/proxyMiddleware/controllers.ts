import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { listExists } from "server/components/proxyMiddleware/helpers";
import { countriesList } from "server/services/metadata";
import * as Routes from "./routes";
import { camelCase } from "lodash";

export function getStartPageController(req: Request, res: Response) {
  const routeUrl = req.path;
  const serviceType = routeUrl.split("/")[2];
  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}

export function getCountrySelectPageController(req: Request, res: Response) {
  const routeUrl = req.path;
  const serviceType = routeUrl.split("/")[2];
  const pagePath = routeUrl.split("/")[3];

  res.render(`apply/${serviceType}/${pagePath}`, {
    countriesList,
    answer: req.session.application?.country,
  });
}

export async function postCountrySelectPageController(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);
  const serviceType = req.path.split("/")[2] as "lawyers" | "funeral-directors";
  const camelCaseServiceType = camelCase(serviceType) as "lawyers" | "funeralDirectors";

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(Routes[camelCaseServiceType].countrySelect);
    return;
  }

  req.session.application = {
    type: serviceType,
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, serviceType);

  if (!list) {
    res.redirect(Routes[camelCaseServiceType].stopPage);
    return;
  }

  res.redirect(Routes[camelCaseServiceType].postCountrySelect);
}

export function getStopPage(req: Request, res: Response) {
  const serviceType = req.path.split("/")[2];

  res.render("apply/not-accepting-currently", {
    backLink: Routes[camelCase(serviceType) as "lawyers" | "funeralDirectors"].countrySelect,
    country: req.session?.application?.country,
  });
}
