/* eslint-disable @typescript-eslint/no-misused-promises */

import type { NextFunction, Request, Response } from "express";
import { addCsrfTokenToLocals, singleRouteCsrf } from "server/middlewares/csrf";

import express from "express";
import { json, urlencoded } from "body-parser";
import { checkCountryQuestionAnswered, checkIsExistingList } from "./middlewares/checkCountryQuestionAnswered";
import * as handlers from "./handlers";

/**
 * proxy middleware does not work if bodyParser, cookies and csrf have been applied to the server before the proxies
 * are initialised. By applying these middlewares to individual routes, it does not interfere with the proxy.
 */
const bodyParser = [json(), urlencoded({ extended: true })];
const middleware = [...bodyParser, singleRouteCsrf, addCsrfTokenToLocals];

export const applyRouter = express.Router();

applyRouter.get("/application/:serviceType(lawyers|funeral-directors)/start", handlers.start.get);
applyRouter.get(
  "/application/:serviceType(lawyers|funeral-directors)/which-country-list-do-you-want-to-be-added-to",
  middleware,
  handlers.countrySelect.get
);
applyRouter.post(
  "/application/:serviceType(lawyers|funeral-directors)/which-country-list-do-you-want-to-be-added-to",
  middleware,
  handlers.countrySelect.post
);
applyRouter.get("/application/:serviceType(lawyers|funeral-directors)/not-currently-accepting", handlers.stop.get);

applyRouter.get("/application/session/*", (req: Request, _res: Response, next: NextFunction) => {
  req.session.application = {
    isInitialisedSession: true,
  };
  next();
});

/**
 * checkCountryQuestionAnswer must come last to prevent circular redirect
 * todo: change to /application/:serviceType(lawyers|funeral-directors|translators-interpreters)/ when funeral-directors
 * and translators and interpreters flow is done.
 */
applyRouter.get(
  "/application/:serviceType(lawyers|funeral-directors|translators-interpreters)/*",
  checkCountryQuestionAnswered,
  checkIsExistingList
);
