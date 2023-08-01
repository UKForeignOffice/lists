import type { NextFunction, Request, Response } from "express";

export function initFindSession(req: Request, _res: Response, next: NextFunction) {
  req.session.answers ??= {};
  next();
}
