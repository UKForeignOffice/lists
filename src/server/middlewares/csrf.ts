import { isTest } from "server/config";
import { logger } from "server/services/logger";
import csrf from "csurf";
import type { Express, NextFunction, Request, Response } from "express";

const CSRFOptions = {
  cookie: true,
  ...(isTest && { ignoreMethods: ["GET", "HEAD", "OPTIONS", "POST"] }),
};

export function configureCsrf(server: Express) {
  logger.warn(`configureCookieParser: CSRF is ${isTest ? "disabled" : "enabled"}`);
  server.use(csrf(CSRFOptions) as any);
  server.use(addCsrfTokenToLocals);
}

export function singleRouteCsrf(req: Request, res: Response, next: NextFunction) {
  csrf(CSRFOptions)(req as any, res as any, next);
}

export function addCsrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}
