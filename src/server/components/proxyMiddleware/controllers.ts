import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { listExists } from "server/components/proxyMiddleware/helpers";
import { countriesList } from "server/services/metadata";
import { camelCase } from "lodash";

const COUNTRY_SELECT_PAGE_PATH = "/application/which-country-list-do-you-want-to-be-added-to";

export function getStartPageController(req: Request, res: Response) {
  const { serviceType } = req.params;

  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}

export function getCountrySelectPageController(req: Request, res: Response) {
  const { serviceType } = req.params;

  res.render("apply/which-country-list-do-you-want-to-be-added-to", {
    countriesList,
    answer: req.session.application?.country,
    backLink: `/application/${serviceType}/start`,
  });
}

export async function postCountrySelectPageController(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);
  const { serviceType } = req.params;
  const camelCaseServiceType = camelCase(serviceType) as "lawyers" | "funeralDirectors";
  const postCountrySelectPageUrl = {
    lawyers: "what-size-is-your-company-or-firm",
    funeralDirectors: "can-you-provide-funeral-services-and-support-to-customers-in-english",
  };

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(COUNTRY_SELECT_PAGE_PATH);
    return;
  }

  req.session.application = {
    type: serviceType as "lawyers" | "funeral-directors",
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, camelCaseServiceType);

  if (!list) {
    res.redirect(`/application/${serviceType}/not-currently-accepting`);
    return;
  }

  res.redirect(`/application/${serviceType}/${postCountrySelectPageUrl[camelCaseServiceType]}`);
}

export function getStopPageController(req: Request, res: Response) {
  res.render("apply/not-accepting-currently", {
    backLink: COUNTRY_SELECT_PAGE_PATH,
    country: req.session?.application?.country,
  });
}
