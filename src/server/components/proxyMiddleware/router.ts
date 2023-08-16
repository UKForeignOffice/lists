/* eslint-disable @typescript-eslint/no-misused-promises */

import type { NextFunction, Request, Response } from "express";
import { addCsrfTokenToLocals, singleRouteCsrf } from "server/middlewares/csrf";

import express from "express";
import { json, urlencoded } from "body-parser";
import { checkCountryQuestionAnswered, checkIsExistingList } from "./middlewares/checkCountryQuestionAnswered";
import * as Controllers from "./controllers";
import * as Routes from "./routes";

/**
 * proxy middleware does not work if bodyParser, cookies and csrf have been applied to the server before the proxies
 * are initialised. By applying these middlewares to individual routes, it does not interfere with the proxy.
 */
const bodyParser = [json(), urlencoded({ extended: true })];
const middleware = [...bodyParser, singleRouteCsrf, addCsrfTokenToLocals];

export const applyRouter = express.Router();

// Lawyers
applyRouter.get(Routes.lawyers.start, Controllers.getStartPageController);
applyRouter.get(Routes.lawyers.countrySelect, middleware, Controllers.getCountrySelectPageController);
applyRouter.post(Routes.lawyers.countrySelect, middleware, Controllers.postCountrySelectPageController);
applyRouter.get(Routes.lawyers.stopPage, Controllers.getStopPageController);

// Funeral Directors
applyRouter.get(Routes.funeralDirectors.start, Controllers.getStartPageController);
applyRouter.get(Routes.funeralDirectors.countrySelect, middleware, Controllers.getCountrySelectPageController);
applyRouter.post(Routes.funeralDirectors.countrySelect, middleware, Controllers.postCountrySelectPageController);
applyRouter.get(Routes.funeralDirectors.stopPage, Controllers.getStopPageController);

// All services
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
  "/application/:serviceType(lawyers|funeral-directors)/*",
  checkCountryQuestionAnswered,
  checkIsExistingList
);
