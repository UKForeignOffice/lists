import { Express } from "express";
import { cookiesRouter } from "./router";
import { isTest } from "server/config";
import csrf from "csurf";

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
}

export async function initCSRF(server: Express): Promise<void> {
  if (!isTest) {
    server.use(csrf({ cookie: false }));
    server.use(function(req, res, next) {
      res.locals._csrf = req.csrfToken();
      next();
    });
  }
}
