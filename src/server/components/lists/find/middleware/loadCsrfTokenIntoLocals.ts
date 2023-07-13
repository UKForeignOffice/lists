import type { NextFunction, Request, Response } from "express";

export function loadCsrfTokenIntoLocals(req: Request, res: Response, next: NextFunction) {
  next();
}
