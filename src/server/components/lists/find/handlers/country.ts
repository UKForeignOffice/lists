import { countriesList } from "server/services/metadata";
import { validateCountry } from "server/models/listItem/providers/helpers";
import type { NextFunction, Request, Response } from "express";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";
import { getRedirectIfListIsEmpty } from "server/components/lists/find/helpers/getRedirectIfListIsEmpty";
import { logger } from "server/services/logger";

export async function redirectIfEmpty(req: Request, res: Response, next: NextFunction) {
  if (req.session.answers?.country) {
    next();
    return;
  }

  const country = req.session.answers?.country ?? req.params.country;
  const serviceType = req.session.answers?.serviceType ?? req.params.serviceType;
  const redirect = await getRedirectIfListIsEmpty(country, getDbServiceTypeFromParameter(serviceType));

  if (redirect) {
    logger.info(
      `${req.originalUrl} user is attempting to access ${serviceType}/${country} but the list is empty, redirecting to ${redirect}`
    );

    res.redirect(redirect);
    return;
  }
  next();
}

export async function get(req: Request, res: Response) {
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
  const redirect = await getRedirectIfListIsEmpty(country, getDbServiceTypeFromParameter(req.params.serviceType));

  if (redirect) {
    res.redirect(redirect);
    return;
  }

  const safe = encodeURIComponent(validatedCountry);
  const prevCountry = req.session.answers?.country;
  req.session.answers!.country = country;
  req.session.answers!.urlSafeCountry = safe;

  if (req.query.return === "results") {
    if (prevCountry !== country) {
      delete req.session.answers!.region;
    }
    logger.info(`POST ${req.originalUrl} - returning to results page`);
    res.redirect(`${safe}/result`);
    return;
  }

  res.redirect(`${safe}/region`);
}
