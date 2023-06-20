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
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";

export function get(req: Request, res: Response) {
  res.render("lists/find/country", {
    countriesList,
    answers: req.session.answers,
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

  // @ts-ignore
  req.session.answers.country = country;
  // @ts-ignore
  req.session.answers.urlSafeCountry = safe;

  const hasQuery = Object.keys(req.query).length;

  // @ts-ignore
  const query = new URLSearchParams(req.query);
  const queryString = hasQuery ? `?${query.toString()}` : "";

  const dbServiceType = getDbServiceTypeFromParameter(req.params.serviceType);

  const redirectIfEmptyList = await getRedirectIfListIsEmpty(country, dbServiceType);

  if (redirectIfEmptyList) {
    res.redirect(redirectIfEmptyList);
    return;
  }

  if (req.session.answers?.disclaimer) {
    res.redirect(`${safe}/result${queryString}`);
    return;
  }

  res.redirect(`${safe}/region${queryString}`);
}

async function getRedirectIfListIsEmpty(country: string, serviceType: string) {
  console.log("redirect", country, serviceType);
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
