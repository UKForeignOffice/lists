import type { Express, NextFunction, Request, Response } from "express";
import { cookiesRouter } from "./router";

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
}

export function addUrlToSession(req: Request, _: Response, next: NextFunction): void {
  req.session.currentUrl = req.originalUrl;
  next();
}
