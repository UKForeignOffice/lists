import type { Express, NextFunction, Request, Response } from "express";
import { cookiesRouter } from "./router";
import { isTest } from "server/config";
import csrf from "csurf";

export const csrfInstance = csrf({ cookie: true });

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
  server.use(csrfInstance);
}

export function getCSRFToken(req: Request): string {
  return !isTest ? req.csrfToken() : "";
}

export function addUrlToSession(req: Request, _: Response, next: NextFunction): void {
  req.session.currentUrl = req.originalUrl;
  next();
}
