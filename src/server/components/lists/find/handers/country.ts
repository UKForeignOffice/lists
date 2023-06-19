import { countriesList } from "server/services/metadata";
import { some, validateCountry } from "server/models/listItem/providers/helpers";
import type { Request, Response } from "express";
import { ServiceType } from "shared/types";
import {
  formatCountryParam,
  getCountryFuneralDirectorsRedirectLink,
  getCountryLawyerRedirectLink,
  getCountryTranslatorsInterpretersRedirectLink,
} from "server/components/lists/helpers";
import type { CountryName } from "server/models/types";
import { listsRoutes } from "server/components/lists";

export function get(req: Request, res: Response) {
  res.render("lists/find/country", {
    countriesList,
  });
}

export async function post(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountry(country);
  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(req.originalUrl);
    return;
  }

  const safe = encodeURIComponent(validatedCountry);
  req.session.answers.country = country;
  req.session.answers.urlSafeCountry = country;

  const hasQuery = Object.keys(req.query).length;
  const query = new URLSearchParams(req.query);
  const queryString = hasQuery ? `?${query.toString()}` : "";

  const redirectIfEmptyList = await getRedirectIfListIsEmpty(country, req.params.serviceType);

  if (redirectIfEmptyList) {
    res.redirect(redirectIfEmptyList);
    return;
  }

  if (req.session.answers?.disclaimer) {
    res.redirect(`${safe.toLowerCase()}/result${queryString}`);
    return;
  }

  res.redirect(`${safe.toLowerCase()}/region${queryString}`);
}

async function getRedirectIfListIsEmpty(country: string, serviceType: string) {
  if (!country || !serviceType) {
    return;
  }

  const countryName: string = formatCountryParam(country);
  const countryHasListItems = await some(countryName as CountryName, serviceType as ServiceType);

  if (countryHasListItems) {
    return;
  }

  switch (serviceType) {
    case ServiceType.lawyers:
      return getCountryLawyerRedirectLink(countryName as CountryName);
    case ServiceType.covidTestProviders:
      return `${listsRoutes.privateBeta}?serviceType=${ServiceType.covidTestProviders}`;
    case ServiceType.funeralDirectors:
      return getCountryFuneralDirectorsRedirectLink(countryName as CountryName);
    case ServiceType.translatorsInterpreters:
      return getCountryTranslatorsInterpretersRedirectLink(countryName as CountryName);
  }
}
