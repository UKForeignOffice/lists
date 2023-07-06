import type { NextFunction, Request, Response } from "express";
import { getParameterValue, removeQueryParameter } from "server/components/lists/helpers";

export function loadAnswersIntoLocals(req: Request, res: Response, next: NextFunction) {
  if (req.query.country) {
    req.session.answers!.country = req.query.country as string;
  }

  res.locals.answers = req.session.answers;
  res.locals.removeQueryParameter = removeQueryParameter;
  res.locals.getParameterValue = getParameterValue;
  next();
}
