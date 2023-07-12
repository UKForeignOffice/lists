import type { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { isTest } from "server/config";
import { logger } from "scheduler/logger";

const CSRFOptions = {
  cookie: true,
  ...(isTest && { ignoreMethods: ["GET", "HEAD", "OPTIONS", "POST"] }),
};
export function configureCookieParser(server: Express): void {
  server.use(cookieParser());

  logger.warn(`initCookies: CSRF is ${isTest ? "disabled" : "enabled"}`);
  server.use(csrf(CSRFOptions));
  server.use(addCsrfTokenToLocals);
}

function addCsrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}
