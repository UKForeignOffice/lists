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
  server.use(csrf(CSRFOptions));
  server.use(addCsrfTokenToLocals);
}

export function singleRouteCsrf(req: Request, res: Response, next: NextFunction) {
  csrf(CSRFOptions)(req, res, next);
}

export function addCsrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}
