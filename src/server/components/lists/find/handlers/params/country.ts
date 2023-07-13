import type { NextFunction, Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { logger } from "server/services/logger";

export function handleCountryParam(req: Request, res: Response, next: NextFunction, country: string) {
  const validatedCountry = validateCountryLower(country);
  if (!validatedCountry) {
    const { serviceType } = req.params;

    logger.error(
      `User requested ${req.originalUrl} but ${country} was not recognised. Redirecting to ${req.params.serviceType}`
    );
    res.redirect(`/find/${serviceType}`);
    return;
  }

  res.locals.urlSafeCountry = encodeURIComponent(country);
  res.locals.country = decodeURIComponent(country);
  req.session.answers = {
    ...req.session.answers,
    country,
  };
  res.locals.answers = req.session.answers;

  next();
}
