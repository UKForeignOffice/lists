/* eslint-disable @typescript-eslint/no-misused-promises */

import type { NextFunction, Request, Response } from "express";
import { addCsrfTokenToLocals, singleRouteCsrf } from "server/middlewares/csrf";

import express from "express";
import { json, urlencoded } from "body-parser";
import { initializeRequestBody } from "server/middlewares/body-parser";
import { checkCountryQuestionAnswered, checkIsExistingList } from "./middlewares/checkCountryQuestionAnswered";
import * as handlers from "./handlers";

const supportedServiceTypes = new Set(["lawyers", "funeral-directors", "translators-interpreters"]);

/**
 * proxy middleware does not work if bodyParser, cookies and csrf have been applied to the server before the proxies
 * are initialised. By applying these middlewares to individual routes, it does not interfere with the proxy.
 */
const bodyParser = [json(), urlencoded({ extended: true }), initializeRequestBody];
const middleware = [...bodyParser, singleRouteCsrf, addCsrfTokenToLocals];

export const applyRouter = express.Router();

applyRouter.get("/application/session{/*path}", (req: Request, _res: Response, next: NextFunction) => {
  req.session.application = {
    isInitialisedSession: true,
  };
  next();
});

// Redirect proxied form-runner sitemap links back to the real sitemap route
applyRouter.get("/application/sitemap", (_req: Request, res: Response) => {
  res.redirect("/sitemap");
});

applyRouter.use("/application/:serviceType", (req: Request, _res: Response, next: NextFunction) => {
  const serviceType = req.params.serviceType;
  if (typeof serviceType === "string" && supportedServiceTypes.has(serviceType)) {
    next();
    return;
  }

  next("router");
});

applyRouter.get("/application/:serviceType/start", handlers.start.get);
applyRouter.get(
  "/application/:serviceType/which-country-list-do-you-want-to-be-added-to",
  middleware,
  handlers.countrySelect.get
);
applyRouter.post(
  "/application/:serviceType/which-country-list-do-you-want-to-be-added-to",
  middleware,
  handlers.countrySelect.post
);
applyRouter.get("/application/:serviceType/not-currently-accepting", handlers.stop.get);

/**
 * checkCountryQuestionAnswer must come last to prevent circular redirect
 */
applyRouter.get("/application/:serviceType{/*path}", checkCountryQuestionAnswered, checkIsExistingList);
