import type { NextFunction, Request, Response } from "express";

export function handleCountryParam(req: Request, res: Response, next: NextFunction, country: string) {
  const funeralDirectorsParamsToSkip = ["insurance", "repatriation"];
  if (funeralDirectorsParamsToSkip.includes(country)) {
    next();
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
