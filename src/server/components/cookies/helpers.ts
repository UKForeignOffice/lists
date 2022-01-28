import { Express, NextFunction, Request, Response } from "express";
import { cookiesRouter } from "./router";
import { isTest } from "server/config";
import csrf from "csurf";

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
}

export const csrfInstance = csrf({ cookie: true });

export const csrfRequestHandler = (!isTest ? csrfInstance : (req: Request, res: Response, next: NextFunction) => {return next();});

export function getCSRFToken(req: Request): string {
  return (!isTest ? req.csrfToken() : "");
}
