import type { NextFunction, Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";

export function loadAnswersIntoLocals(req: Request, res: Response, next: NextFunction) {
  const country = req.query.country;
  const validatedCountry = validateCountryLower(country as string | string[]);
  if (validatedCountry) {
    req.session.answers!.country = req.query.country as string;
  }
  res.locals.answers = req.session.answers;
  next();
}
