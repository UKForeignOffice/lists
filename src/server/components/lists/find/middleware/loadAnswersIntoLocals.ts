import type { NextFunction, Request, Response } from "express";

export function loadAnswersIntoLocals(req: Request, res: Response, next: NextFunction) {
  if (req.query.country) {
    req.session.answers!.country = req.query.country as string;
  }
  res.locals.answers = req.session.answers;
  next();
}
