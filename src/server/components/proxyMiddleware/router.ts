import type { NextFunction, Request, Response } from "express";
import { addCsrfTokenToLocals, singleRouteCsrf } from "server/middlewares/csrf";
import { countriesList } from "server/services/metadata";

import express from "express";
import { json, urlencoded } from "body-parser";
import { checkCountryQuestionAnswered, checkIsExistingList } from "./middlewares/checkCountryQuestionAnswered";
import { lawyersPostController } from "./controllers";

/**
 * proxy middleware does not work if bodyParser, cookies and csrf have been applied to the server before the proxies
 * are initialised. By applying these middlewares to individual routes, it does not interfere with the proxy.
 */
const bodyParser = [json(), urlencoded({ extended: true })];
const middleware = [...bodyParser, singleRouteCsrf, addCsrfTokenToLocals];

export const applyRouter = express.Router();

applyRouter.get("/application/lawyers/start", (req: Request, res: Response) => {
  req.session.application ??= {};
  res.render("apply/lawyers/start");
});
applyRouter.get("/application/lawyers/which-list-of-lawyers", middleware, (req: Request, res: Response) => {
  res.render("apply/lawyers/which-list-of-lawyers", { countriesList, answer: req.session.application?.country });
});
applyRouter.post("/application/lawyers/which-list-of-lawyers", middleware, lawyersPostController);
applyRouter.get("/application/lawyers/not-currently-accepting", (req: Request, res: Response) => {
  res.render("apply/not-accepting-currently", {
    backLink: "/application/lawyers/which-list-of-lawyers",
    country: req.session?.application?.country,
  });
});
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
applyRouter.get("/application/:serviceType(lawyers)/*", checkCountryQuestionAnswered, checkIsExistingList);
