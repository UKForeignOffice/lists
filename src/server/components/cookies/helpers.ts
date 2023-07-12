import type { Express, NextFunction, Request, Response } from "express";
import { cookiesRouter } from "./router";
import { isTest } from "server/config";
import csrf from "csurf";
import { logger } from "server/services/logger";

const CSRFOptions = {
  cookie: true,
  ...(isTest && { ignoreMethods: ["GET", "HEAD", "OPTIONS", "POST"] }),
};

export const csrfInstance = csrf(CSRFOptions);

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
  logger.warn(`initCookies: CSRF is ${isTest ? "disabled" : "enabled"}`);
  server.use(csrfInstance);
  server.use(addCsrfTokenToLocals);
}

export function addUrlToSession(req: Request, _: Response, next: NextFunction): void {
  req.session.currentUrl = req.originalUrl;
  next();
}

function addCsrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}
